import UserResolver from '../users/resolvers/user.resolvers';
import VideoProcessingResolver from '../videoProcessor/resolvers/video.processing.resolvers';
import InterviewResolver from '../interview/resolvers/interview.resolvers';

export const resolvers = [
  UserResolver,
  VideoProcessingResolver,
  InterviewResolver,
] as const;
