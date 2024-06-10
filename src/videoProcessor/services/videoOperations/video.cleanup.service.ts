import VideoProcessorModel from '../../../videoProcessor/models/videoProcessor.model';
import AssessmentResponseModel from '../../../interview/models/assessments/assessment.response.model';
import fs from 'fs-extra';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import {
  scriptDirectory,
  videoCleanUpDownloadPath,
  videoCleanUpProcessingPath,
  videoCleanUpUploadPath,
} from '../../../utilities/constants';
import ClientResponse from '../../../utilities/response';
import { deleteFile, moveFile } from '../utils';

export const cleanUpVideos = async function executeProcessVideoCleanUp() {
  const videoDir = join(scriptDirectory, videoCleanUpDownloadPath);
  const uploadDir = join(scriptDirectory, videoCleanUpUploadPath);

  try {
    const files = await fs.readdir(videoDir);
    if (files.length === 0) {
      console.log('No video in the cleanup downloads folder to process');
      return new ClientResponse(400, false, 'No video in the cleanup downloads folder to process', null);
    }

    const inputVideoPath = join(videoDir, files[0]);
    const outputVideoPath = join(scriptDirectory, videoCleanUpProcessingPath, files[0]);
    const uploadVideoPath = join(uploadDir, files[0]);

    console.log('Processing video cleanup...');
    await convertToMp4(inputVideoPath, outputVideoPath);
    await moveFile(outputVideoPath, uploadDir);
    
    const videoDurationInSeconds = await getVideoDuration(uploadVideoPath);
    console.log('Video duration (seconds):', videoDurationInSeconds);

    await updateDocument(files[0], videoDurationInSeconds);
    await VideoProcessorModel.uploadFileToAws(inputVideoPath);
    await deleteFile(inputVideoPath);

    console.log("Video cleanup and upload completed successfully!");
    return 'success';
  } catch (error) {
    console.error('Error during video cleanup:', error);
    throw new ClientResponse(500, false, 'Error during video cleanup', error.message);
  }
};

function convertToMp4(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputFormat('mp4')
      .videoCodec('copy')
      .audioCodec('copy')
      .addOutputOption('-strict', '-2')
      .on('end', resolve)
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg error:', err);
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
        reject(err);
      })
      .save(outputPath);
  });
}

function getVideoDuration(filePath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filePath)
      .ffprobe((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.format.duration);
        }
      });
  });
}

async function updateDocument(fileName: string, videoDurationInSeconds: any) {
  try {
      const filter = { video_link: fileName };
      const update = { $set: { video_duration: videoDurationInSeconds } };
      await AssessmentResponseModel.findOneAndUpdate(filter, update, { new: true });

      const filter2 = { 'videos.video_link': fileName };
      const update2 = { $set: { 'videos.$.isCleanedUp': true } };
      await VideoProcessorModel.findOneAndUpdate(filter2, update2, { new: true });
    return 'success';
  } catch (error) {
    console.error('Error updating documents:', error);
    throw error;
  }
}
