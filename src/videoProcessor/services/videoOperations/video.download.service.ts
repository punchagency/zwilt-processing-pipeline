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

const errorLogService = new ErrorLogService();
// export async function fetchVideosToProcess(type: VIDEO_OPERATION_TYPE) {
//   const videoProcessingPathType = type === VIDEO_OPERATION_TYPE.TRANSCRIBE
//       ? videoTranscribeProcessingPath
//       : videoReelsProcessingPath;
//   const processingDir = join(__dirname, videoProcessingPathType);
//   fs.readdir(processingDir, async (err, files) => {
//     if (err) {
//       console.error('Error reading the processing folder:', err);
//     } else {
//       files.forEach(file => {
//         const filePath = path.join(CONSTANTS.PROCESSING_FOLDER, file);
//         fs.unlink(filePath, deleteError => {
//           if (deleteError) {
//             console.error(`Error deleting file ${file}:`, deleteError);
//           } else {
//             console.log(`Deleted file: ${file}`);
//           }
//         });
//       });
//       downloadVideosLocally(type);
//     }
//   });
// }

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
  const result = await VideoProcessorModel.find({})
    .select('-_id -videos._id -createdAt -__v')
    .exec();

  if (!result) {
    return new ClientResponse(404, false, 'No video to process', null);
  }
  const newResult = result.map((data: any) => {
    return {
      user: data.user,
      videos:
      type === VIDEO_OPERATION_TYPE.TRANSCRIBE
      ? data.videos.filter(
          (item: any) => 
            (item.isTranscribed === false || item.isCleanedUp === false) &&
            item.video_link
        )
          : type === VIDEO_OPERATION_TYPE.VIDEO_REEL
          ? data.videos.filter(
              (item: any) => item.isReelGenerated === false && item.video_link
            )
          : null,
    };
  });

  let links: any = [];
  const validLinks: any = [];
  const promises: any = [];

  newResult.forEach(obj => {
    links = [...obj.videos.map((o: any) => o.video_link), ...links];
  });

  if (newResult.length > 0) {
    // Filter out invalid links before downloading
    links.forEach((link: any) => {
      const fullURL = link.startsWith('https')
        ? link
        : CONSTANTS.ZWILT_S3_URL + link;
      const promise = new Promise((resolve, reject) => {
        https.get(fullURL, (res: any) => {
          console.log('LINKS____', fullURL);
          if (res.statusCode >= 200 && res.statusCode < 400) {
            validLinks.push(fullURL);
            resolve('success');
          } else {
            reject('failure');
          }
        });
      });
      promises.push(promise);
    });
    // Filter out invalid links before downloading
    return Promise.all(promises)
      .then(() => {
        return (async () => {
          const videoShortsDownloadPathType =
             type === VIDEO_OPERATION_TYPE.TRANSCRIBE
              ? videoTranscribeDownloadPath
              : videoReelsDownloadPath;
          const path = join(__dirname, videoShortsDownloadPathType);
          await Promise.all(
            validLinks.map((url: any) =>
              download(url, path, {
                filename: encodeURIComponent(filterUrl(url)),
              })
            )
          );
        })()
          .then(() => {
            if (validLinks.length > 0) {
              console.log('Videos Downloaded...');
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
            } else {
              console.log('No videos to download');
              return new ClientResponse(
                404,
                false,
                'No videos to download',
                null
              );
            }
          })
          .catch(error => {
            console.log('Error occurred when downloading videos.', error);
            errorLogService.logAndNotifyError('downloadInterviewVideosLocally', error);
          });
      })
      .catch(err => {
        console.log('An error occurred while checking the links: ', err);
        errorLogService.logAndNotifyError('downloadInterviewVideosLocally', err);
      });
  } else {
    return new ClientResponse(404, false, 'No videos to process', null);
  }
};
