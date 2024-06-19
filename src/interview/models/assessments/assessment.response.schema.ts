// import InterviewComment from '../../../clients/models/submodels/interviewComments/interviewComment.schema';
import { Field, ObjectType } from 'type-graphql';
import {
  prop,
  Ref,
  ReturnModelType,
} from '@typegoose/typegoose';
import createResponse from './methods/createResponse';
import { AssessmentCategory } from './assessment.category.schema'
import { getModelForClass } from '@typegoose/typegoose';

@ObjectType()
export class AssessmentResponseTranscriptWords {
  @Field()
  @prop()
  text: string;

  @Field()
  @prop()
  start: number;

  @Field()
  @prop()
  end: number;
}

@ObjectType()
export class AssessmentResponseTranscript {
  @Field()
  @prop()
  id: string;

  @Field()
  @prop()
  text: string;

  @Field(() => [AssessmentResponseTranscriptWords])
  @prop()
  words: AssessmentResponseTranscriptWords[];
}

@ObjectType()
export class AssessmentResponseTranscriptWithTimestamps {
  @Field()
  @prop()
  timestamp: string;

  @Field()
  @prop()
  phrase: string;
}

@ObjectType()
export class AssessmentResponse {
  @Field()
  _id: string;

  @Field(() => AssessmentCategory)
  @prop()
  category: Ref<AssessmentCategory>

  @Field()
  @prop()
  questionId: string;

  @Field()
  @prop()
  question!: string;

  @Field({ nullable: true })
  @prop()
  questionSummary?: string;

  @Field()
  @prop()
  video_link!: string;

  @Field()
  @prop()
  preview_link: string;

  @Field({ nullable: true })
  @prop()
  video_duration?: number;

  @Field(() => AssessmentResponseTranscript, { description: 'AssessmentResponseTranscript for the video interview' })
  @prop({ type: AssessmentResponseTranscript })
  transcript: AssessmentResponseTranscript;

  @Field(() => [AssessmentResponseTranscriptWithTimestamps], { description: 'submission transcript with timestamps' })
  @prop()
  transcriptWithTimestamps: AssessmentResponseTranscriptWithTimestamps[];

  @Field()
  @prop()
  timer: number;

  @Field()
  @prop()
  uniqueId: string;

  @Field()
  @prop()
  followOnNumber: number;

  @Field()
  @prop()
  questionNumber: number;

  @Field()
  @prop()
  voice: string;

  @Field()
  @prop()
  retaken: boolean;

  @Field()
  @prop()
  uploaded: boolean;

  @Field()
  @prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @prop({ default: Date.now })
  updatedAt: Date

  public static async createResponse(
    this: ReturnModelType<typeof AssessmntResponse>,
    input: any
  ) {
    return createResponse(this, input)
  }
}

export const AssessmentResponseModel = getModelForClass(AssessmentResponse);