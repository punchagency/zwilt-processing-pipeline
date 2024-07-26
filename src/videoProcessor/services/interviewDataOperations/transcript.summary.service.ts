import { GenerateStatus } from './../../../interview/models/assessments/interview.assessments.schema';
import { openAIService } from '../../../utilities/openAi/openAi';
import interviewAssessmentModel from '../../../interview/models/assessments/interview.assessments.model'
import ErrorLogService from '../../../errorLog/error.log.service';

interface IUpdateSummaryInput {
  _id: string;
  textToSummarize: string,
  totalQuestionsInAllCategory: number,
  totalPickedQuestions: number,
  categoryLength: number,
}

const errorLogService = new ErrorLogService();
export const getTranscriptsFromDatabase = async (): Promise<void> => {
  try {
    let anyAssessmentProcessed = false; // Flag to track if any assessment was processed

    while (true) {
      const assessmentsWithoutSummary = await interviewAssessmentModel.find({
        $or: [
          { interviewSummary: { $exists: false } },
          { interviewSummaryStatus: { $ne: GenerateStatus.COMPLETED } },
        ],
      }).populate({
        path: 'categories',
        model: 'AssessmentCategory',
        populate: {
          path: 'assessmentResponse',
          model: 'AssessmentResponse',
        },
      })
      .lean()
      .exec();
      // return assessmentsWithoutSummary;

      let assessmentsProcessed = false; // Flag to track if any assessments were processed in this loop iteration

      for (const assessment of assessmentsWithoutSummary) {
        const response = await processAssessments(assessment);
        if (response?.textToSummarize) {
          anyAssessmentProcessed = true;
          assessmentsProcessed = true;
          const summary = await generateTranscriptSummary(response.textToSummarize || '');
          await updateDocument(response, summary);
        }
      }

      if (!assessmentsProcessed) {
        // No assessments were processed in this loop iteration, so break the loop
        break;
      }
    }

    if (!anyAssessmentProcessed) {
      console.log("No assessment with picked responses found. Stopping recursion.");
      return; // Stop the recursion if no assessment was processed
    }

    // Call getTranscriptsFromDatabase recursively
    return await getTranscriptsFromDatabase(); // Await the recursive call
  } catch (error) {
    console.error('Error fetching assessments without summary:', error);
    await errorLogService.logAndNotifyError('processTranscriptSummary', error);
    throw error; // Rethrow the error to propagate it up the chain
  }
};

async function processAssessments(assessment: any) {
  let totalQuestionsInAllCategory = 0;
  let totalPickedQuestions = 0;
  let assessmentSummaryText = "";

  // Calculate totalQuestionsInAllCategory
  for (const category of assessment.categories) {
    totalQuestionsInAllCategory += category.totalQuestionsInCategory;
  }

  // Pick assessmentResponse objects
  for (const category of assessment.categories) {
    const assessmentResponses = category.assessmentResponse || []; // Handle undefined assessmentResponse
    const categoryLength = assessmentResponses.length;
    const toPick = Math.min(categoryLength, 2); // Pick up to 2 assessmentResponse objects per category

    for (let i = 0; i < toPick; i++) {
      if (totalPickedQuestions < totalQuestionsInAllCategory) {
        const response = assessmentResponses[i];
        if (response && response.transcript && response.transcript.text) {
          const responseText = response.transcript.text;
          assessmentSummaryText += responseText + " ";
          totalPickedQuestions++;
        }
      }
    }
  }

  // Check if any assessment response was picked
  const summaryTotalSummarized = assessment.interviewTotalSummarized || 0;
  if (totalPickedQuestions > 0 && totalPickedQuestions > summaryTotalSummarized) {
    console.log("totalPickedQuestions...", totalPickedQuestions)
    console.log("summaryTotalSummarized...", summaryTotalSummarized)
    return {
      _id: assessment._id,
      textToSummarize: assessmentSummaryText.trim(),
      totalQuestionsInAllCategory,
      totalPickedQuestions,
      categoryLength: assessment.categories.length,
    };
  }
  console.log("No assessment with picked responses found.");
  return null;
}

export const generateTranscriptSummary = async (textToSummarize: string) => {
  try {
    const request = `Summarize the following interview:\n\n${textToSummarize}`;
    console.log('Generating Summary...');
    const response = await openAIService.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: request,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      const summary = response.choices[0].message.content;
      return summary;
    } else {
      console.error('Unexpected response format from OpenAI.');
    }
  } catch (error) {
    console.error('An error occurred while generating the summary:', error);
    await errorLogService.logAndNotifyError('processTranscriptSummary', error);
    throw error;
  }
};

const updateDocument = async (input: IUpdateSummaryInput, summary: any) => {
  const { _id, totalPickedQuestions, categoryLength } = input;
  const expectedPickedQuestions = categoryLength * 2;
  const generateStatus =
    totalPickedQuestions >= expectedPickedQuestions
      ? GenerateStatus.COMPLETED
      : GenerateStatus.PARTIAL;

  try {
    const filter = { _id: _id };
    const update = { $set: { interviewSummary: summary, interviewSummaryStatus: generateStatus, interviewTotalSummarized: totalPickedQuestions } };
    const response = await interviewAssessmentModel.findOneAndUpdate(filter, update, { new: true });
    console.log('Updated interview summary in db...');
    return response;
  } catch (error) {
    console.error('Error updating documents:', error);
    await errorLogService.logAndNotifyError('processTranscriptSummary', error);
    throw error;
  }
};
