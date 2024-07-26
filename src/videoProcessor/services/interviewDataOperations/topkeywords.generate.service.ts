import { openAIService } from "../../../utilities/openAi/openAi";
import interviewAssessmentModel from '../../../interview/models/assessments/interview.assessments.model';
import { GenerateStatus } from "../../../interview/models/assessments/interview.assessments.schema";
import ErrorLogService from "../../../errorLog/error.log.service";

const errorLogService = new ErrorLogService();
export const generateTalentTopKeywords = async (): Promise<void> => {
    try {
        let anyAssessmentProcessed = false; // Flag to track if any assessment was processed

        while (true) {
            const assessmentsWithoutTopKeywords = await interviewAssessmentModel.find({
                $and: [
                    {
                        $or: [
                            { interviewSummary: { $exists: true } },
                            { interviewSummary: { $nin: [null, ''] } },
                        ]
                    },
                    { interviewSummaryStatus: { $ne: GenerateStatus.PARTIAL } },
                    { topKeywordsStatus: { $ne: GenerateStatus.COMPLETED } }
                ]
            });

            if (assessmentsWithoutTopKeywords.length === 0) {
                console.log('No Interview found without topKeywords');
                return;
            }

            let assessmentsProcessed = false; // Flag to track if any assessments were processed in this loop iteration

            for (const assessment of assessmentsWithoutTopKeywords) {
                try {
                    const interviewSummary = assessment.interviewSummary;
                    if (!interviewSummary || !interviewSummary.length) {
                        continue;
                    }
                    const generatedTopKeywords = await useOpenAI(interviewSummary);
                    if (generatedTopKeywords) {
                        await updateDocument(assessment._id, JSON.parse(generatedTopKeywords), assessment.interviewSummaryStatus);
                        anyAssessmentProcessed = true;
                        assessmentsProcessed = true;
                    }
                } catch (err) {
                    console.error(`Error processing assessment with ID ${assessment._id}:`, err);
                    await errorLogService.logAndNotifyError('processTopkeywords', err);
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
            console.log("No assessment with top keywords to process.");
        }
    } catch (error) {
        console.error('An error occurred while fetching assessments:', error);
        await errorLogService.logAndNotifyError('processTopkeywords', error);
        throw error;
    }
};

const useOpenAI = async (transcriptText: string): Promise<string | null> => {
    try {
        const prompt = `Retrieve the top 5 words from the provided interview text and present them in a JSON array of strings. Ensure the keywords are meaningful words, not words like 'the, is, as, with', etc. Format the output as a JSON array of strings. Example: ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]`;
        const request = `${prompt}\n\n${transcriptText}`;
        console.log('Generating top 5 keywords...');
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
            const topKeywords = response.choices[0].message.content.trim();
            console.log('Generated top keywords:', topKeywords);

            // Validate if the response is a valid JSON string
            try {
                const parsedKeywords = JSON.parse(topKeywords);
                if (Array.isArray(parsedKeywords)) {
                    return JSON.stringify(parsedKeywords); // Convert back to string to maintain original function's return type
                } else if (typeof parsedKeywords === 'object' && parsedKeywords !== null) {
                    // Extract the array from the object
                    const keywordArray = Object.values(parsedKeywords).find(value => Array.isArray(value));
                    if (keywordArray) {
                        return JSON.stringify(keywordArray); // Convert back to string to maintain original function's return type
                    } else {
                        console.error('Top keywords array not found in the expected format:', topKeywords);
                        return null;
                    }
                } else {
                    console.error('Top keywords are not in expected format:', topKeywords);
                    return null;
                }
            } catch (err) {
                console.error('Error parsing top keywords:', err, 'Response:', topKeywords);
                await errorLogService.logAndNotifyError('processTopkeywords', err);
                return null;
            }
        } else {
            console.error('Unexpected response format from OpenAI.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while generating the summary:', error);
        await errorLogService.logAndNotifyError('processTopkeywords', error);
        return null;
    }
};



const updateDocument = async (_id: string, topKeywords: any, interviewSummaryStatus: string): Promise<any> => {
    const COLOR_PALETTE = ['#ccc4ff', '#f9ae96', '#a2b6fd', '#d2f6ce', '#fde4a2'];
    try {
        const filter = { _id: _id };

        const topKeywordsWithColors = topKeywords.map((keyword: string, index: number) => ({
            keyword,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length],
        }));
        const topKeywordsStatus = interviewSummaryStatus === GenerateStatus.COMPLETED ? GenerateStatus.COMPLETED : GenerateStatus.PARTIAL;
        const update = { $set: { topKeywords: topKeywordsWithColors, topKeywordsStatus } };

        const response = await interviewAssessmentModel.findOneAndUpdate(filter, update, { new: true });
        return response;
    } catch (error) {
        console.error('Error updating document:', error);
        await errorLogService.logAndNotifyError('processTopkeywords', error);
        throw error;
    }
};
