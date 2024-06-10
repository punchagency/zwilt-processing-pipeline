import {
  modelOptions,
  prop,
  ReturnModelType,
  Severity,
} from '@typegoose/typegoose';
import {Field, ObjectType} from 'type-graphql';
import {VideoDataInput} from '../../videoProcessor/dto/inputs/videoProcessorData';
import saveVideoForProcessing from '../../videoProcessor/methods/saveVideoForProcessing';
import getInterviewAssessmentToProcess from '../../videoProcessor/methods/reels/getInterviewAssessmentToProcess';
import downloadVideosLocally from '../../videoProcessor/methods/downloadVideosLocally';
import generateVideoReel from '../../videoProcessor/methods/reels/generateVideoReel';
import { VIDEO_OPERATION_TYPE } from '../../videoProcessor/services/enum';
import uploadFileToAws from '../../videoProcessor/methods/uploadFileToAws';


@ObjectType()
export class Video {
  @Field()
  @prop()
  video_link: string;

  @Field()
  @prop()
  video_duration?: number;

  @Field()
  @prop()
  isVideoProcessed?: boolean;

  @Field()
  @prop()
  isTranscribed?: boolean;

  @Field()
  @prop()
  isReelGenerated?: boolean;

  @Field()
  @prop()
  isDownloaded?: boolean;

  @Field()
  @prop()
  isCleanedUp?: boolean;
}

@ObjectType()
@modelOptions({options: {allowMixed: Severity.ALLOW}})
class VideoProcessor {
  @Field()
  _id: string;

  @Field()
  browserType?: string;

  @Field(() => [Video])
  @prop()
  videos: Video[];

  @Field()
  @prop({default: Date.now()})
  createdAt: Date;

  public static async saveVideoData(
    this: ReturnModelType<typeof VideoProcessor>,
    input: VideoDataInput
  ): Promise<VideoProcessor> {
    return saveVideoForProcessing(this, input);
  }

  public static async getInterviewAssessmentToProcess(
    this: ReturnModelType<typeof VideoProcessor>,
    type?: string,
  ) {
    return getInterviewAssessmentToProcess(this, type);
  }

  public static async downloadVideosLocally(
    this: ReturnModelType<typeof VideoProcessor>,
    type: VIDEO_OPERATION_TYPE,
    links: string[]
  ) {
    return downloadVideosLocally(type, links);
  }

  public static async generateVideoReel(
    this: ReturnModelType<typeof VideoProcessor>,
    assessmentId: string,
    filteredInterviewAssessment: any,
    links: string[],
  ) {
    return generateVideoReel(this, assessmentId, filteredInterviewAssessment, links);
  }

  public static async uploadFileToAws(
  videoFilePath: string
  ) {
    return uploadFileToAws(videoFilePath);
  }
}

export default VideoProcessor;
