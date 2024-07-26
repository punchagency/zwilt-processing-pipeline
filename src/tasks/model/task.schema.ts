import { getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
@ObjectType()
export class Task {
  @Field()
  _id: string;

  @Field({ nullable: true })
  @prop()
  shouldRunInterviewCron?: boolean;

  @Field()
  @prop({ default: Date.now, required: true })
  createdAt: Date;

  @Field()
  @prop({ default: Date.now, required: true })
  updatedAt: Date;
}

export const TaskModel = getModelForClass(Task);