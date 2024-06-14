import { dummyVideoData } from './../../../utilities/transcripts/dummy-transcript-data';
import { mapTranscriptWordsToObjects } from "../../../utilities/transcripts/formatTranscriptIntoSentences";
import {join} from 'path';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
// import { OpenAIService } from '../../../utilities/openAi/OpenAIService';

export const transcriptWords = [
    {
        __typename: 'TranscriptWords',
        text: 'In,',
        start: 5080,
        end: 5244,
    },
    {
        __typename: 'TranscriptWords',
        text: 'my',
        start: 5282,
        end: 5580,
    },
    {
        __typename: 'TranscriptWords',
        text: 'previous',
        start: 5650,
        end: 6136,
    },
    {
        __typename: 'TranscriptWords',
        text: 'job',
        start: 6248,
        end: 6572,
    },
     {
        __typename: 'TranscriptWords',
        text: 'experience,',
        start: 6626,
        end: 7230,
    },
    {
        __typename: 'TranscriptWords',
        text: 'I',
        start: 8000,
        end: 8316,
    },
    {
        __typename: 'TranscriptWords',
        text: 'have',
        start: 8338,
        end: 8524,
    },
    {
        __typename: 'TranscriptWords',
        text: 'been',
        start: 8562,
        end: 8764,
    },
    {
        __typename: 'TranscriptWords',
        text: 'more',
        start: 8802,
        end: 8956,
    },
    {
        __typename: 'TranscriptWords',
        text: 'or',
        start: 8978,
        end: 9116,
    },
    {
        __typename: 'TranscriptWords',
        text: 'less',
        start: 9138,
        end: 9372,
    },
    {
        __typename: 'TranscriptWords',
        text: 'a',
        start: 9426,
        end: 9644,
    },
    {
        __typename: 'TranscriptWords',
        text: 'freelance',
        start: 9682,
        end: 10248,
    },
    {
        __typename: 'TranscriptWords',
        text: 'web',
        start: 10344,
        end: 10652,
    },
    {
        __typename: 'TranscriptWords',
        text: 'developer,',
        start: 10706,
        end: 11816,
    },
    {
        __typename: 'TranscriptWords',
        text: 'developing',
        start: 12008,
        end: 12792,
    },
    {
        __typename: 'TranscriptWords',
        text: 'various',
        start: 12856,
        end: 13272,
    },
    {
        __typename: 'TranscriptWords',
        text: 'sites.',
        start: 13336,
        end: 13736,
    },
    {
        __typename: 'TranscriptWords',
        text: 'But',
        start: 26232,
        end: 26524,
    },
    {
        __typename: 'TranscriptWords',
        text: 'I',
        start: 26562,
        end: 26668,
    },
    {
        __typename: 'TranscriptWords',
        text: 'do',
        start: 26674,
        end: 26916,
    },
    {
        __typename: 'TranscriptWords',
        text: 'more.',
        start: 26978,
        end: 27590,
    }]


export const generateVideoReelSingle = async (_: any, _res: any) => {
    const transcriptWordsData = dummyVideoData[0].transcript.words;
    const mappedTranscripts = mapTranscriptWordsToObjects(transcriptWordsData, 0);
    
    return mappedTranscripts;  
};

export const getMappedTranscript = async () => {
    let allMappedTranscripts: any = [];

    dummyVideoData.forEach((videoData, index) => {
        const transcriptWordsData = videoData.transcript.words;
        const mappedTranscripts = mapTranscriptWordsToObjects(transcriptWordsData, index);
        allMappedTranscripts = allMappedTranscripts.concat(mappedTranscripts);
    });

    return allMappedTranscripts;
};



// export const generateVideoReelTest = async (_: any, res: any) => {
export const generateVideoReelTest = async () => {
    // const openAIService = new OpenAIService();

    // const allMappedTranscripts = [
    //     {
    //         "transcript": "In, my previous job experience, I have been more or less a freelance web developer, developing various sites, both static and dynamic, using languages on the main stack and also using on the lamp stack.",
    //         "start": 5.08,
    //         "end": 26.104,
    //         "mapIndex": 0
    //     },
    //     {
    //         "transcript": "But I do more with the mainstack.",
    //         "start": 26.232,
    //         "end": 31.584,
    //         "mapIndex": 0
    //     },
    //     {
    //         "transcript": "That is MongoDB express, react and OJS.",
    //         "start": 31.632,
    //         "end": 35.872,
    //         "mapIndex": 0
    //     },
    //     {
    //         "transcript": "I have built API, I have integrated database and payment solution systems, I have developed a well optimized website that low faster and is easy to use in terms of user interactiveness.",
    //         "start": 36.016,
    //         "end": 61.5,
    //         "mapIndex": 0
    //     },
    //     {
    //         "transcript": "A middleware in expressgs can be simply described as a certain function, if I would say where that stands in between the server and the and the server and the client side application.",
    //         "start": 10.33,
    //         "end": 34.92,
    //         "mapIndex": 1
    //     },
    //     {
    //         "transcript": "We have middleware that help us to validate passwords.",
    //         "start": 35.37,
    //         "end": 41.746,
    //         "mapIndex": 1
    //     }
    // ];

    // const allMappedTranscripts = await getMappedTranscript();
    
    // const videoDir = join(__dirname, '../../storage/tempVideos');

    const videoDir = join(__dirname, '../../storage/videoReels/downloads');
    const videoPath = [`${videoDir}/mAiiSINo_16952049601571.mp4`, `${videoDir}/sfyCcI4l_16952052294213.mp4`];
    // const videoPath = [`${videoDir}/MPXZOCA3_16953923046091_001.mp4`, `${videoDir}/EB7anzQS_16953927236492_002.mp4`, `${videoDir}/6U7jtOzY_16953930577403_003.mp4`];

  
    async function checkFileAndDirectory(filePath: any) {
        try {
            // Check if directory exists
            await fs.access(videoDir);
            console.log('Directory exists:', videoDir);

            // Log all items in the directory
            const files = await fs.readdir(videoDir);
            console.log('Files in directory:', files);
        } catch (err) {
            console.error('Directory does not exist:', videoDir);
            return false;
        }

        try {
            // Check if file exists
            await fs.access(filePath);
            console.log('File exists:', filePath);
            return true;
        } catch (err) {
            console.error('File does not exist:', filePath);
            return false;
        }
    }
    try {
        // Analyze the mapped transcripts with OpenAI
        // const prompt = `From the following transcripts, select the ones with key moments and return them in the exact same format they currently are:\n\n${JSON.stringify(allMappedTranscripts)}`;
        // const response = await openAIService.analyzeTranscript(prompt);
        const response = [
            {
                "transcript": "But I do more with the mainstack.",
                "start": 26.232,
                "end": 31.584,
                "mapIndex": 0
            },
            {
                "transcript": "I have built API, I have integrated database and payment solution systems, I have developed a well optimized website that low faster and is easy to use in terms of user interactiveness.",
                "start": 36.016,
                "end": 61.5,
                "mapIndex": 0
            }
        ];
    

        console.log('Raw response from OpenAI:', response);

        if (response === null) {
            console.error('OpenAI returned null');
            // res.status(500).json({ error: 'Failed to get a valid response from OpenAI' });
            return { error: 'Failed to get a valid response from OpenAI' };
            return;
        }

        let keyMoments;
        try {
            keyMoments = response;
            // keyMoments = JSON.parse(response);
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            console.error('Response:', response);
            // res.status(500).json({ error: 'Failed to parse response from OpenAI' });
            return { error: 'Failed to parse response from OpenAI' };
            return;
        }

        console.log("keyMoments...", keyMoments);

        const tempFiles: any = [];

        // Extract key moments from respective videos
        for (const moment of keyMoments) {
            const { start, end, mapIndex } = moment;
            const videoFile = videoPath[mapIndex];
            const tempFile = `${videoDir}/temp_${mapIndex}_${start}_${end}.mp4`;
            tempFiles.push(tempFile);

            const fileExists = await checkFileAndDirectory(videoPath);
            if (!fileExists) {
                console.error('Cannot process video because the file or directory does not exist.');
                return;
            }

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
        const outputReel = `${videoDir}/video_reel_${uniqueId}.mp4`;
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
        // res.json({ video_reel: outputReel });
        return { video_reel: outputReel };

    } catch (error) {
        console.error('Error in generateVideoReel:', error);
        // res.status(500).json({ error: 'Failed to generate video reel' });
        return { error: 'Failed to generate video reel' };
    }
};