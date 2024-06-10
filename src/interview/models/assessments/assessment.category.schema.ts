import { Field, ObjectType } from 'type-graphql';
import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import { AssessmentResponse } from './assessment.response.schema';

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
@ObjectType()
export class AssessmentCategory {
  @Field()
  _id!: string;

  @Field()
  @prop()
  categoryId: string;

  @Field()
  @prop()
  name!: string;

  @Field()
  @prop()
  totalQuestionsInCategory!: number;

  @Field(() => [AssessmentResponse])
  @prop()
  assessmentResponse!: Ref<AssessmentResponse>[];

  @Field()
  @prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @prop({ default: Date.now })
  updatedAt: Date
}

export const AssessmentCategoryModel = getModelForClass(AssessmentCategory);