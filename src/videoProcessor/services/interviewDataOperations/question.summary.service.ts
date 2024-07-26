import { openAIService } from '../../../utilities/openAi/openAi';
import ClientResponse from '../../../utilities/response';
import AssessmentResponseModel from '../../../interview/models/assessments/assessment.response.model';
import ErrorLogService from '../../../errorLog/error.log.service';

const errorLogService = new ErrorLogService();

export const getQuestionsFromDatabase = async (): Promise<ClientResponse | null> => {
  try {
    let anyAssessmentProcessed = false; // Flag to track if any assessment was processed

    while (true) {
      const assessmentsWithoutQuestionSummary = await AssessmentResponseModel.find({
        $or: [
          { questionSummary: { $exists: false } },
          { questionSummary: { $in: [null, ""] } },
        ]
      }, '_id question')
        .sort({ createdAt: 1 });

      if (assessmentsWithoutQuestionSummary.length === 0) {
        console.log("No transcript record to summarize");
        return new ClientResponse(404, false, "No transcript record to summarize", null);
      }
      console.log("assessmentsWithoutQuestionSummary....[......]", assessmentsWithoutQuestionSummary);
      let assessmentsProcessed = false; // Flag to track if any assessments were processed in this loop iteration

      for (const response of assessmentsWithoutQuestionSummary) {
        try {
          console.log("AssessmentResponseId...", response._id);
          const questionToSummarize = response.question;
          const summarizedQuestion = await useOpenAI(questionToSummarize);
          if (summarizedQuestion) {
            await updateDocument(response._id, summarizedQuestion);
            anyAssessmentProcessed = true;
            assessmentsProcessed = true;
          }
        } catch (err) {
          console.error(`Error processing assessment with ID ${response._id}:`, err);
          await errorLogService.logAndNotifyError('processQuestionSummary', err);
          // Continue with the next assessment
          continue;
        }
      }

      if (!assessmentsProcessed) {
        // No assessments were processed in this loop iteration, so break the loop
        break;
      }
    }

    if (!anyAssessmentProcessed) {
      console.log("No assessment with question summary to process.");
      return new ClientResponse(200, true, "No assessment with question summary to process.", null);
    }

    return new ClientResponse(200, true, "Summarization completed", null);
  } catch (error) {
    console.error("Error fetching data:", error);
    await errorLogService.logAndNotifyError('processQuestionSummary', error);
    throw error;
  }
};

// const maxAssessmentsPerRun = 10; // or another appropriate number

// export const getQuestionsFromDatabase = async (): Promise<ClientResponse | null> => {
//   try {
//     let anyAssessmentProcessed = false;

//     while (true) {
//       const assessmentsWithoutQuestionSummary = await AssessmentResponseModel.find({
//         $or: [
//           { questionSummary: { $exists: false } },
//           { questionSummary: { $in: [null, ""] } },
//         ]
//       }, '_id question')
//         .sort({ createdAt: 1 })
//         .limit(maxAssessmentsPerRun);

//       if (assessmentsWithoutQuestionSummary.length === 0) {
//         console.log("No transcript record to summarize");
//         return new ClientResponse(404, false, "No transcript record to summarize", null);
//       }

//       let assessmentsProcessed = false;

//       for (const response of assessmentsWithoutQuestionSummary) {
//         try {
//           console.log("AssessmentResponseId...", response._id);
//           const questionToSummarize = response.question;
//           const summarizedQuestion = await useOpenAI(questionToSummarize);
//           if (summarizedQuestion) {
//             await updateDocument(response._id, summarizedQuestion);
//             anyAssessmentProcessed = true;
//             assessmentsProcessed = true;
//           }
//         } catch (err) {
//           console.error(`Error processing assessment with ID ${response._id}:`, err);
//           await errorLogService.logAndNotifyError('processQuestionSummary', err);
//           continue;
//         }
//       }

//       if (!assessmentsProcessed) {
//         break; // Exit loop if no assessments were processed
//       }
//     }

//     if (!anyAssessmentProcessed) {
//       console.log("No assessment with question summary to process.");
//       return new ClientResponse(200, true, "No assessment with question summary to process.", null);
//     }

//     return new ClientResponse(200, true, "Summarization completed", null);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     await errorLogService.logAndNotifyError('processQuestionSummary', error);
//     throw error;
//   }
// };


const useOpenAI = async (questionToSummarize: string): Promise<string | null> => {
  try {
    const request = `Summarize this question in 2 to 3 words:\n\n${questionToSummarize}`;
    console.log('Generating question summary...');
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
      const summarizedQuestion = response.choices[0].message.content;
      return summarizedQuestion;
    } else {
      console.error('Unexpected response format from OpenAI.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while generating the summary:', error);
    await errorLogService.logAndNotifyError('processQuestionSummary', error);
    return null;
  }
};

const updateDocument = async (_id: string, summary: string): Promise<void> => {
  try {
    const filter = { _id };
    const update = { $set: { questionSummary: summary } };
    const response = await AssessmentResponseModel.findOneAndUpdate(filter, update, { new: true });
    console.log('Updated questionSummary in database:', response?.questionSummary);
  } catch (error) {
    console.error('Error updating questionSummary documents:', error);
    await errorLogService.logAndNotifyError('processQuestionSummary', error);
    throw error;
  }
};
