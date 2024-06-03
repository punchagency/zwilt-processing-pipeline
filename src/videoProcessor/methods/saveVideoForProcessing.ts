import {ReturnModelType} from '@typegoose/typegoose';
import {VideoDataInput} from 'videoProcessor/dto/inputs/videoProcessorData';
import VideoProcessor from '../models/videoProcessor.schema';

export default async function saveVideoForProcessing(
  videoProcessor: ReturnModelType<typeof VideoProcessor>,
  input: VideoDataInput
) {
  const videoData = await new videoProcessor(input);
  const res = await videoData.save();
  return res;
}
