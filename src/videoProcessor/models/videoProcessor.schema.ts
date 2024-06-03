import {
  modelOptions,
  prop,
  ReturnModelType,
  Severity,
} from '@typegoose/typegoose';
import {Field, ObjectType} from 'type-graphql';
import {VideoDataInput} from '../../videoProcessor/dto/inputs/videoProcessorData';
import saveVideoForProcessing from '../../videoProcessor/methods/saveVideoForProcessing';


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
  isPreviewed?: boolean;

  @Field()
  @prop({default: false})
  isHlsConverted?: boolean;

  @Field()
  @prop()
  isHLSProcessed?: boolean;

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
}

export default VideoProcessor;
