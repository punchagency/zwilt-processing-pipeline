import {getModelForClass} from '@typegoose/typegoose';
import VideoProcessor from './videoProcessor.schema';

const VideoProcessorModel = getModelForClass(VideoProcessor);

export default VideoProcessorModel;
