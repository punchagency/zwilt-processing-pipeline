import {
  modelOptions,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { Field, ObjectType, registerEnumType } from 'type-graphql';
import User from '../../../users/models/users.schema';
import { AssessmentCategory } from './assessment.category.schema';
import { InterviewStatus } from '../interview.schema';
import { IsInt, Max, Min } from 'class-validator';
import { AssessmentResponseTranscript } from './assessment.response.schema';

registerEnumType(InterviewStatus, {
  name: 'InterviewStatus',
});


@ObjectType()
export class AssessmentTopKeyword {
  @Field()
  @prop()
  keyword: string;

  @Field()
  @prop()
  color: string;
}

@ObjectType()
export class InterviewReel {
  @Field()
  @prop()
  video_link: string;

  @Field({ nullable: true })
  @prop()
  video_duration?: number;

  @Field(() => AssessmentResponseTranscript, { description: 'Transcript for the video reel' })
  @prop({ type: AssessmentResponseTranscript })
  transcript!: AssessmentResponseTranscript;
}

@ObjectType()
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class InterviewAssessment {
  @Field()
  _id: string;

  @Field(() => User)
  @prop({ ref: User })
  user: Ref<User>;

  @Field(() => [AssessmentCategory])
  @prop({ ref: () => AssessmentCategory, default: [] })
  categories: Ref<AssessmentCategory>[];

  @Field()
  @prop()
  role: string;

  @Field()
  @prop({ default: InterviewStatus.PENDING, required: true })
  status: string;

  @Field(() => Boolean, {description: 'Indicates if this assessment profile has been contacted.'})
  @prop({ default: false})
  contacted: boolean;
  
  @Field()
  @prop({
    required: true,
    default: 5,
    validate: {
      validator: (value: number) => value >= 1 && value <= 100,
      message: 'completionRatio must be between 1 and 100',
    },
  })
  @IsInt()
  @Min(1)
  @Max(100)
  completionRatio!: number;

  @Field({ nullable: true })
  @prop()
  interviewSummary?: string;

  @Field({ nullable: true })
  @prop({ required: true })
  interviewLength!: number;

  @Field(() => InterviewReel, { nullable: true })
  @prop({ _id: false })
  interviewReel?: InterviewReel;

  @Field(() => [AssessmentTopKeyword], {
    description: 'Top keywords for talent',
  })
  @prop(() => [AssessmentTopKeyword])
  topKeywords?: Ref<AssessmentTopKeyword>[];
  
  @Field()
  @prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @prop({ default: Date.now })
  updatedAt: Date
}