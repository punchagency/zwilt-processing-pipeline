import { Field, ObjectType } from 'type-graphql';
import {
  prop,
  ReturnModelType,
} from '@typegoose/typegoose';
import createResponse from './methods/createResponse';


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
export class AssessmentResponse {
  @Field()
  _id: string;

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
  transcript!: AssessmentResponseTranscript;

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
    this: ReturnModelType<typeof AssessmentResponse>,
    input: any
  ) {
    return createResponse(this, input)
  }
}