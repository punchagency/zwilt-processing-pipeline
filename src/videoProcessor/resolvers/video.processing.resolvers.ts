import {FileUpload, GraphQLUpload} from 'graphql-upload';
import {Arg, Ctx, Mutation, Resolver} from 'type-graphql';
import {Service} from 'typedi';
import User from '../../users/models/users.schema';
import VideoProcessingService from '../services/video.processing.services';

@Service()
@Resolver()
export default class VideoProcessingResolver {
  constructor(private readonly videoProcessingService: VideoProcessingService) {
    console.log('VideoProcessingResolver');
  }

  @Mutation(() => Boolean)
  async uploadHls(
    @Ctx('getUser')
    _getUser: () => User,
    @Arg('file', () => GraphQLUpload)
    {createReadStream}: FileUpload
  ) {
    const stream = createReadStream();

    return this.videoProcessingService.processHlsVideo(stream);
  }
}
