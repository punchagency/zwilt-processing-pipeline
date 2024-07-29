import { ReturnModelType } from '@typegoose/typegoose';
import VideoProcessor, { ErrorLog } from '../models/videoProcessor.schema';

export default async function updateVideoError(
  videoProcessorModel: ReturnModelType<typeof VideoProcessor>,
  videoLink: string,
  errorMessage: string
): Promise<VideoProcessor | null> {
  const videoProcessor = await videoProcessorModel.findOne({ 'videos.video_link': videoLink });
  if (!videoProcessor) {
    console.error('VideoProcessor not found for videoLink:', videoLink);
    return null;
  }
  const video = videoProcessor.videos.find(v => v.video_link === videoLink);
  if (video) {
    if (!videoProcessor.errorLog) {
      videoProcessor.errorLog = new ErrorLog();
    }
    videoProcessor.errorLog.errorFlag = true;
    videoProcessor.errorLog.errorMessage = errorMessage;
    videoProcessor.errorLog.retriesCount = (videoProcessor.errorLog.retriesCount || 0) + 1;
    await videoProcessor.save();
  }
  return videoProcessor;
}
