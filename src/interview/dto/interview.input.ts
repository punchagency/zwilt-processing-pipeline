import { Field, InputType } from 'type-graphql';
import { InterviewStatus } from '../models/interview.schema'

@InputType()
class TranscriptWithTimestampsInput {
  @Field()
  transcriptTimer: number;

  @Field()
  timestamp: string;

  @Field()
  phrase: string;
}

@InputType()
class s3ObjectResponseInput {
  @Field()
  location: string;

  @Field()
  key: string;
}

@InputType()
class questionResponseInput {
  @Field()
  questionId: string;

  @Field()
  uniqueId: string;

  @Field()
  followOnNumber: number;

  @Field()
  questionNumber: number;

  @Field()
  question: string;

  @Field()
  response: s3ObjectResponseInput;

  @Field()
  voice: string;

  @Field()
  isFollowUp: boolean;

  @Field()
  retaken: boolean;

  @Field()
  uploaded: boolean;

  @Field()
  transcript?: string;

  @Field()
  timer: number;

  @Field(() => [TranscriptWithTimestampsInput])
  transcriptWithTimestamps: TranscriptWithTimestampsInput[];
}

@InputType()
class categoryResponseInput {
  @Field()
  categoryId: string;

  @Field()
  categoryName: string;

  @Field()
  totalQuestionsInCategory: number;

  @Field(() => [questionResponseInput])
  questions: questionResponseInput[];
}

@InputType()
export class submitInterviewresponsesInput {
  @Field()
  job: string;

  @Field()
  guest: string;

  @Field(() => [categoryResponseInput])
  categories: categoryResponseInput[];
}

@InputType()
export class getInterviewResponsesInput {
  @Field()
  jobId: string;

  @Field()
  guestId: string;
}

@InputType()
export class getCategoryQuestionInput extends getInterviewResponsesInput {
  @Field()
  categoryId: string;

  @Field()
  questionId: string;

  @Field()
  uniqueId: string;
}

export interface CreateAssessmentInput {
  job: string;
  user: string;
  categories: any[],
  status?: InterviewStatus;
  // organization: string;
}

export interface UpdateAssessmentResponseInput {
  job: string;
  user: string;
  repsonse: {
    questionId: string;
    question: string;
    video_link: string;
  }
}

export interface CreateAssessmentResponseInput {
  questionId: string;
  question: string;
  video_link: string;
  retaken: boolean;
  uploaded: boolean;
  voice: string;
}

export interface CreateAssessmentCategoriesInput {
  categoryId: string;
  name: string;
  totalQuestionsInCategory: number;
  assessmentResponse: any[]
}

@InputType()
export class ProfileFilters {
  @Field(() => [String])
  experience: string[];

  @Field(() => [String])
  interviewLength: string[];

  @Field(() => [String])
  location: string[];

  @Field(() => [String])
  tags: string[];

  @Field(() => [String])
  availability: string[];
}

export interface GetAssessmentCategoryInput {
  assessmentId: string;
  userId: string;
}