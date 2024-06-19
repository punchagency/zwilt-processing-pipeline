
export const CONSTANTS = {
  DOWNLOAD_FOLDER: './downloads',
  UPLOADS_FOLDER: './uploads',
  PROCESSING_FOLDER: './processing',
  DOWNLOADS: 'downloads',
  UPLOADS: 'uploads',
  PROCESSING: 'processed',
  VTS_FOLDER: './VTS',
  ZWILT_S3_URL: 'https://zwilt.s3.amazonaws.com/',
  START_UP_ENDPOINT: 'http://localhost:5000/api/pipeline/getVideoForProcessing',
  BUCKET: 'zwilt',
};

export const scriptDirectory = __dirname;

//VIDEO_CLEANUP
export const videoCleanUpDownloadPath =
  '../../src/videoProcessor/storage/videoCleanUp/downloads';
export const videoCleanUpProcessingPath =
  '../../src/videoProcessor/storage/videoCleanUp/processing';
export const videoCleanUpCompressedPath =
  '../../src/videoProcessor/storage/videoCleanUp/compressed';
export const videoCleanUpUploadPath = '../../src/videoProcessor/storage/videoCleanUp/upload';
//VIDEO_SHORTS
export const videoShortsDownloadPath =
  '../../src/videoProcessor/storage/videoShorts/downloads';
export const videoShortsProcessingPath =
  '../../src/videoProcessor/storage/videoShorts/processing';
export const videoShortsUploadPath =
  '../../src/videoProcessor/storage/videoShorts/upload';
//TRANSCRIBE
export const videoTranscribeDownloadPath =
  '../../src/videoProcessor/storage/videoTranscribe/downloads';
export const videoTranscribeProcessingPath =
  '../../src/videoProcessor/storage/videoTranscribe/processing';
export const convertedAudioPath =
  '../../src/videoProcessor/storage/videoTranscribe/convertedAudios';
//REEL
export const videoReelsDownloadPath =
  '../../src/videoProcessor/storage/videoReels/downloads';
export const videoReelsProcessingPath =
  '../../src/videoProcessor/storage/videoReels/processing';
  
export const videoClippingDownloadPath = 'src/videoProcessor/storage/videoClipping/download';
export const videoClippingUploadPath = 'src/videoProcessor/storage/videoClipping/upload';
export const interviewResponseScreenshot = 'src/videoProcessor/storage/interviewResponses/screenshots';
export const interviewResponseVideo = 'src/videoProcessor/storage/interviewResponses/videos';