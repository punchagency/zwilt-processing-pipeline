import ResolverResponse from '../../../utilities/resolverResponse';
import {Field, Int, ObjectType} from 'type-graphql';
import { InterviewAssessment } from '../../models/assessments/interview.assessments.schema';

@ObjectType()
export class InterviewProfiles extends ResolverResponse {
  @Field(() => [InterviewAssessment])
  data: InterviewAssessment[];
}

@ObjectType()
export class InterviewAssessmentResponse extends ResolverResponse {
  @Field(() => InterviewAssessment)
  data: InterviewAssessment;
}

@ObjectType()
export class InterviewAssessmentsResponse extends ResolverResponse {
  @Field(() => [InterviewAssessment])
  data: InterviewAssessment[];
}

@ObjectType()
export class TrendingKeyword {
  @Field()
  keyword: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class TrendingKeywordResponse extends ResolverResponse {
  @Field(() => [TrendingKeyword])
  data: TrendingKeyword[];
}