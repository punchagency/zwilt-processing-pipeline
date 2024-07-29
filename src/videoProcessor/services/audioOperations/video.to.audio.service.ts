import ffmpeg from 'fluent-ffmpeg';
import { join, basename } from 'path';
import fs from 'fs';
import { ensureDir } from 'fs-extra'; 
import { existsSync } from 'fs-extra';  
// import { convertedAudioPath, scriptDirectory, videoTranscribeDownloadPath } from '../../../utilities/constants';
import { assemblyAITranscribeAudio } from '../videoOperations/video.transcribe.service';
import ErrorLogService from '../../../errorLog/error.log.service';

const errorLogService = new ErrorLogService();

export async function convertVideoToMP3() {
  const inputDirectory = join(__dirname, '../../storage/videoTranscribe/downloads');
  const outputDirectory = join(__dirname, '../../storage/videoTranscribe/convertedAudios');

  try {
    // Ensure the output directory exists
    await ensureDir(outputDirectory);

    if (!existsSync(inputDirectory)) {
      console.error('Input directory not found.');
      return;
    }

    // Get a list of files in the input directory
    const files = fs.readdirSync(inputDirectory);

    // Filter for video files (e.g., .mp4)
    const videoFiles = files.filter(file => file.endsWith('.mp4'));

    if (videoFiles.length === 0) {
      console.error('No video files found in the input directory.');
      return;
    }

    console.log("Converting mp4 to mp3....");

    for (const videoFile of videoFiles) {
      const inputVideo = join(inputDirectory, videoFile);
      const outputMP3 = join(outputDirectory, basename(inputVideo, '.mp4') + '.mp3');

      console.log("InputVideo...", inputVideo);
      console.log("Output Mp3...", outputMP3);

      try {
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(inputVideo)
            .audioCodec('libmp3lame')
            .audioBitrate(192)
            .audioChannels(2)
            .audioFrequency(44100)
            .format('mp3')
            .on('end', () => {
              console.log(`Conversion finished for ${inputVideo}.`);
              resolve('success');
            })
            .on('error', (err) => {
              console.error(`Error converting video to MP3 for ${inputVideo}:`, err);
              errorLogService.logAndNotifyError('videoToAudioService', err);
              reject(err);
            })
            .save(outputMP3);
        });

        // Call the transcription service for the successfully converted file
        await assemblyAITranscribeAudio();

      } catch (conversionError) {
        console.error(`Skipping file due to error: ${inputVideo}`, conversionError);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    await errorLogService.logAndNotifyError('videoToAudioService', error);
  }
}
