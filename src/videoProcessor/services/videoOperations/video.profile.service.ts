import https from 'https';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import download from 'download';
import { AWSS3Uploader } from '../../../utilities/uploaders/s3';
import {
  scriptDirectory,
  CONSTANTS,
  interviewResponseScreenshot,
  interviewResponseVideo
} from '../../../utilities/constants';
import { deleteFile } from '../../../utilities/deleteFile';
import { filterUrl } from '../utils';
import assessmentModel from '../../../interview/models/assessments/interview.assessments.model';
import { AssessmentCategory } from '../../../interview/models/assessments/assessment.category.schema';
import { AssessmentResponse } from '../../../interview/models/assessments/assessment.response.schema';
import userModel from '../../../users/models/users.model';
import User from '../../../users/models/users.schema';

export const saveProfilePicture = async () => {
  try {
    console.log("STARTED PROCESSING PROFILE PICTURE")
    const assessments = await assessmentModel.find({})
      .populate('user')
      .populate({
        path: 'categories',
        populate: {
          path: 'assessmentResponse',
        }
      }).lean();

    for (const assessment of assessments) {
      if (!assessment) continue;
      const user = assessment.user as User;
      if (user?.profile_img) continue;

      // 1. download first video
      if (!assessment.categories.length) continue;
      const { assessmentResponse } = assessment?.categories[0] as AssessmentCategory;
      if (!assessmentResponse.length) continue;
      const firstResponse = assessmentResponse[0] as AssessmentResponse;
      const link = firstResponse.video_link;
      if (!link) continue;
      const fullURL = link.startsWith('https') ? link : `${CONSTANTS.ZWILT_S3_URL}${link}`;

      // validating video link
      await validateLink(fullURL);

      // 2. download video
      const videoPath = join(scriptDirectory, interviewResponseVideo);
      fs.promises.mkdir(videoPath, { recursive: true });
      const videoFileName = encodeURIComponent(filterUrl(fullURL));
      await download(fullURL, videoPath, {
        filename: videoFileName,
      });

      //3. Take screenshot for the downloaded video
      const videoFile = join(videoPath, videoFileName)
      const screenShotURL = await takeScreenshot(videoFile, fullURL);

      //4. save profile image
      await userModel.updateOne(
        {
          _id: user?._id,
        },
        {
          profile_img: screenShotURL
        }
      );

      // handle success
      // 5. delete files when completed
      deleteFile(videoFile);
    }
  } catch (error) {
    console.error('Error Saving Profile Picture:', error);
    throw error
  }
}

async function validateLink(url: string) {
  try {
    await new Promise<void>((resolve, reject) => {
      https.get(url, (res: any) => {
        console.log('LINKS____', url);
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          reject('failure');
        }
      });
    });
  } catch (error) {
    console.error('Error validating link:', error);
    throw error;
  }
};

async function takeScreenshot(videoPath: string, url: string): Promise<string> {
  try {
    const fileName = `screenshot_${encodeURIComponent(filterUrl(url.split('.mp4')[0]))}.jpg`;
    const screenShotPath = join(scriptDirectory, interviewResponseScreenshot);

    fs.promises.mkdir(screenShotPath, { recursive: true });

    // Get the duration of the video
    const ffprobeData: any = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
    const durationInSeconds = ffprobeData.format.duration == 'N/A' ? 0 : ffprobeData.format.duration;

    // Calculate the middle time mark
    const middleTimeMark = (durationInSeconds / 2) || 5;

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .takeScreenshots(
          {
            count: 1,
            filename: fileName,
            size: '320x240', // can change resolution here
            timemarks: [middleTimeMark.toString()],
          },
          screenShotPath
        )
        .on('end', resolve)
        .on('error', reject);
    });

    console.log('Screenshot taken successfully:', fileName);

    const s3Uploader = new AWSS3Uploader();
    console.log(`UPLOADING SCREENSHOT.... ${fileName}`);

    const screenshotFile = join(screenShotPath, fileName)
    const result = await s3Uploader.uploadFile(screenshotFile, fileName, false);
    deleteFile(screenshotFile);

    return result.url;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}
