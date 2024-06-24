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
import { getModelForClass } from '@typegoose/typegoose';

registerEnumType(InterviewStatus, {
  name: 'InterviewStatus',
});

export enum GenerateStatus {
  NONE = 'NONE',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
}


registerEnumType(GenerateStatus, {
  name: 'GenerateStatus',
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
export class InterviewReelTranscript {
  @Field()
  @prop()
  text: string;

  @Field()
  @prop()
  start: number;

  @Field()
  @prop()
  end: number;

  @Field()
  @prop()
  mapIndex: number;
}

@ObjectType()
export class InterviewReel {
  @Field()
  @prop()
  video_link: string;

  @Field({ nullable: true })
  @prop()
  video_duration?: number;

  @Field({ nullable: true })
  @prop()
  noOfVideosUsedForReel?: number;

  @Field(() => [InterviewReelTranscript])
  @prop()
  transcript!: InterviewReelTranscript[];
}
@ObjectType()
@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: { timestamps: true },
})
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

  @Field(() => Boolean, { description: 'Indicates if this assessment profile has been contacted.' })
  @prop({ default: false })
  contacted: boolean;

  @Field()
  @prop({
    required: true,
    default: 0,
    validate: {
      validator: (value: number) => value >= 0 && value <= 100,
      message: 'completionRatio must be between 0 and 100',
    },
  })
  @IsInt()
  @Min(0)
  @Max(100)
  completionRatio!: number;

  @Field({ nullable: true })
  @prop()
  questionSummary?: string;

  @Field({ nullable: true })
  @prop()
  interviewSummary?: string;

  @Field()
  @prop({ default: GenerateStatus.NONE})
  interviewSummaryStatus: string;

  @Field({ nullable: true })
  @prop()
  interviewTotalSummarized?: number;

  @Field({ nullable: true })
  @prop()
  interviewLength: number;

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

export default getModelForClass(InterviewAssessment);