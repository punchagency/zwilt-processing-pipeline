import { mapTranscriptWordsToObjects } from "../../../utilities/transcripts/formatTranscriptIntoSentences";
import {join} from 'path';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { OpenAIService } from '../../../utilities/openAi/OpenAIService';
import ClientResponse from '../../../utilities/response';
import VideoProcessor from "../../../videoProcessor/models/videoProcessor.schema";
import { ReturnModelType } from "@typegoose/typegoose";
import InterviewAssessmentModel from "../../../interview/models/assessments/interview.assessments.model";
import { deleteFilesInDirectory } from "../../../videoProcessor/services/utils";
import { InterviewReelTranscript } from "../../../interview/models/assessments/interview.assessments.schema";


export default async function generateVideoReel(
    videoProcessor: ReturnModelType<typeof VideoProcessor>,
    assessmentId: string,
    interviewAssessment: any,
    videoLinks: string[]
  ){
    const openAIService = new OpenAIService();
    const allMappedTranscripts = await getMappedTranscript(interviewAssessment);

    const videoDir = join(__dirname, '../../storage/videoReels/downloads');


    try {
        // Analyze the mapped transcripts with OpenAI
        const prompt = `From the following transcripts, select the ones with key moments and return them in the exact same format they currently are:\n\n${JSON.stringify(allMappedTranscripts)}`;
        const response = await openAIService.analyzeTranscript(prompt);

        console.log('Raw response from OpenAI:', response);

        if (response === null) {
            console.error('OpenAI returned null');
            return { error: 'Failed to get a valid response from OpenAI' };
            
        }

        let keyMoments;
        try {
            keyMoments = JSON.parse(response);
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            console.error('Response:', response);
            return { error: 'Failed to parse response from OpenAI' };
        }

        console.log("keyMoments...", keyMoments);


        const tempFiles: any = [];

        // Extract key moments from respective videos
        for (const moment of keyMoments) {
            const { start, end, mapIndex } = moment;
            const videoFile = videoDir+'/'+videoLinks[mapIndex];
            const tempFile = `${videoDir}/temp_${mapIndex}_${start}_${end}.mp4`;
            tempFiles.push(tempFile);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(videoFile)
                    .setStartTime(start)
                    .setDuration(end - start)
                    .output(tempFile)
                    .on('end', () => {
                        console.log(`Extracted segment: ${tempFile}`);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error(`Error extracting segment: ${err.message}`);
                        reject(err);
                    })
                    .run();
            });
        }

        // Stitch the extracted key moments together
        const uniqueId = Date.now();
        const reelFileName = `video_reel_${uniqueId}_${assessmentId}.mp4`;
        const outputReel = `${videoDir}/${reelFileName}`;
        const tmpFolder = `${videoDir}/tmp`; // Temporary folder for intermediate files

        // Ensure the temporary folder exists
        await fs.mkdir(tmpFolder, { recursive: true });

        await new Promise<void>((resolve, reject) => {
            const ffmpegCommand = ffmpeg();
            tempFiles.forEach((file: any) => {
                ffmpegCommand.input(file);
            });
            ffmpegCommand
                .on('end', () => {
                    console.log('Successfully stitched videos together');
                    resolve();
                })
                .on('error', (err) => {
                    console.error(`Error stitching videos: ${err.message}`);
                    reject(err);
                })
                .mergeToFile(outputReel, tmpFolder);
        });

        // Clean up temporary files
        for (const file of tempFiles) {
            await fs.unlink(file);
        }

        const totalDuration = keyMoments.reduce((acc: any, moment: any) => acc + (moment.end - moment.start), 0);
        console.log('Total Duration of Stitched Reels:', totalDuration);

        // Send response
       const res = await videoProcessor.uploadFileToAws(outputReel);
       console.log("Uploaded Reel Response...", res);
        await updateDocument(assessmentId, reelFileName, keyMoments, videoLinks.length, totalDuration).then(()=> {
            // deleteFile(outputReel); 
            deleteFilesInDirectory(videoDir);
        });
        return new ClientResponse(200, true, 'success', { video_reel: outputReel });

    } catch (error) {
        console.error('Error in generateVideoReel:', error);
        return new ClientResponse(500, false, 'error', { error: 'Failed to generate video reel' });
    }
  }



export const getMappedTranscript = async (interviewAssessment: any) => {
    let allMappedTranscripts: any = [];

    interviewAssessment.forEach((videoData: any, index: number) => {
        const transcriptWordsData = videoData.response.transcript.words;
        const mappedTranscripts = mapTranscriptWordsToObjects(transcriptWordsData, index);
        allMappedTranscripts = allMappedTranscripts.concat(mappedTranscripts);
    });

    return allMappedTranscripts;
};


const updateDocument = async (
    assessmentId: string,
    reelFileName: string,
    keyMoments: InterviewReelTranscript,
    noOfVideosUsedForReel: number,
    totalDuration: number,
): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const currentAssessment = await InterviewAssessmentModel.findById(assessmentId);
            if (!currentAssessment) {
                reject(new Error('Assessment not found'));
                return;
            }

            const { interviewReel } = currentAssessment;
            const currentVal = interviewReel?.noOfVideosUsedForReel || 0;
            console.log("currentNoOfVideosUsedForReel...", currentVal);

            const update = {
                $set: {
                    "interviewReel.video_link": reelFileName,
                    "interviewReel.noOfVideosUsedForReel": noOfVideosUsedForReel,
                    "interviewReel.video_duration": totalDuration,
                    "interviewReel.transcript": keyMoments,
                },
            };

            const updatedAssessment = await InterviewAssessmentModel.findByIdAndUpdate(assessmentId, update, { new: true });
            if (!updatedAssessment) {
                reject(new Error('Failed to update assessment'));
                return;
            }

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};
