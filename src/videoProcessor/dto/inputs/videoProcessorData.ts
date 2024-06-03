import {Field, InputType} from 'type-graphql';
import { Video } from 'videoProcessor/models/videoProcessor.schema';

@InputType()
export class VideoDataInput {

  @Field(() => [Video])
  videos: Video[];

  @Field()
  isVideoProcessed?: boolean;

  @Field()
  isDownloaded?: boolean;
}

