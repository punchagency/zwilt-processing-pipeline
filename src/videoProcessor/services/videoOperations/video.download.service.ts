import https from 'https';
import download from 'download';
import {join} from 'path';
// import path from 'path';
import fs from 'fs-extra';
import {
  CONSTANTS,
  videoReelsDownloadPath,
  videoReelsProcessingPath,
  videoTranscribeDownloadPath,
  videoTranscribeProcessingPath,
} from '../../../utilities/constants';
import ClientResponse from '../../../utilities/response';
import VideoProcessorModel from '../../../videoProcessor/models/videoProcessor.model';
import {filterUrl} from '../utils';
import {VIDEO_OPERATION_TYPE} from '../enum';
import {convertVideoToMP3} from '../audioOperations/video.to.audio.service';
import ErrorLogService from '../../../errorLog/error.log.service';
import InterviewAssessmentModel from '../../../interview/models/assessments/interview.assessments.model';

const errorLogService = new ErrorLogService();
export async function fetchVideosToProcess(type: VIDEO_OPERATION_TYPE) {
  const videoProcessingPathType = type === VIDEO_OPERATION_TYPE.TRANSCRIBE
      ? videoTranscribeProcessingPath
      : videoReelsProcessingPath;
  const processingDir = join(__dirname, videoProcessingPathType);

  try {
    // Ensure the processing directory exists
    await fs.ensureDir(processingDir);

    // Read the directory contents
    const files = await fs.readdir(processingDir);

    // Delete files in the directory
    await Promise.all(files.map(file => {
      const filePath = join(processingDir, file); // Fixed path join
      return fs.unlink(filePath)
        .then(() => console.log(`Deleted file: ${file}`))
        .catch(deleteError => console.error(`Error deleting file ${file}:`, deleteError));
    }));

    // Proceed to download videos
    await downloadVideosLocally(type);

  } catch (err) {
    console.error('Error processing the folder:', err);
    errorLogService.logAndNotifyError('fetchVideosToProcess', err);
  }
}


export const downloadVideosLocally = async (type: VIDEO_OPERATION_TYPE) => {
  try {
    // Fetch all interview assessments to get the user references
    const assessments = await InterviewAssessmentModel.find({})
      .select('user')
      .exec();

    const userIds = assessments.map((assessment: any) => assessment?.user?.toString());

    // Fetch all VideoProcessor documents
    const videoProcessors = await VideoProcessorModel.find({
      $or: [
        { 'errorLog.errorFlag': { $ne: true } },
        { 'errorLog.errorFlag': { $exists: false } },
        { errorLog: { $exists: false } }
      ]
    })
      .select('-_id -videos._id -createdAt -__v')
      .exec();
    

    if (!videoProcessors || videoProcessors.length === 0) {
      return new ClientResponse(404, false, 'No video to process', null);
    }

    // Filter video processors based on matching user IDs
    const filteredProcessors = videoProcessors?.filter((processor: any) =>
      userIds.includes(processor?.talent?.toString())
    );

    // Map filtered processors to extract video links
    const newResult = filteredProcessors.map((processor: any) => ({
      user: processor.talent,
      videos:
        type === VIDEO_OPERATION_TYPE.TRANSCRIBE
          ? processor.videos.filter(
              (video: any) =>
                (video.isTranscribed === false || video.isCleanedUp === false) &&
                video.video_link
            )
          : type === VIDEO_OPERATION_TYPE.VIDEO_REEL
          ? processor.videos.filter(
              (video: any) =>
                video.isReelGenerated === false && video.video_link
            )
          : [],
    }));

    // Collect unique video links to be validated and downloaded
    const links = new Set<string>();

    newResult.forEach(obj => {
      obj.videos.forEach((video: any) => {
        const fullURL = video.video_link.startsWith('https')
          ? video.video_link
          : CONSTANTS.ZWILT_S3_URL + video.video_link;
        links.add(fullURL);
      });
    });

    const validLinks: string[] = [];
    const linkValidationPromises: Promise<void>[] = [];

    // Validate the links
    links.forEach((link: string) => {
      const promise = new Promise<void>((resolve) => {
        https.get(link, (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            validLinks.push(link);
          }
          resolve(); // Always resolve to proceed with other links
        }).on('error', () => {
          resolve(); // Resolve even on error to skip invalid links
        });
      });
      linkValidationPromises.push(promise);
    });

    // Wait for all link validations to complete
    await Promise.all(linkValidationPromises);

    if (validLinks.length === 0) {
      console.log('No valid links to download');
      return new ClientResponse(404, false, 'No valid links to download', null);
    }

    // Download the valid links
    const videoShortsDownloadPathType =
      type === VIDEO_OPERATION_TYPE.TRANSCRIBE
        ? videoTranscribeDownloadPath
        : videoReelsDownloadPath;
    const path = join(__dirname, videoShortsDownloadPathType);

    await Promise.all(
      validLinks.map((url: string) =>
        download(url, path, {
          filename: encodeURIComponent(filterUrl(url)),
        })
      )
    );

    console.log('Videos Downloaded...');

    // Process videos if needed
    switch (type) {
      case VIDEO_OPERATION_TYPE.TRANSCRIBE:
        convertVideoToMP3();
        break;
      case VIDEO_OPERATION_TYPE.VIDEO_REEL:
        // processVideoShorts();
        break;
      default:
        console.log('Nothing to process...');
        break;
    }

    return new ClientResponse(200, true, 'Process video', null);
  } catch (error) {
    console.log('Error occurred when processing videos.', error);
    errorLogService.logAndNotifyError('downloadInterviewVideosLocally', error);
    return new ClientResponse(500, false, 'Internal server error', null);
  }
};