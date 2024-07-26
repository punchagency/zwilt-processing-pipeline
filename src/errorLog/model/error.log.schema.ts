import { getModelForClass, modelOptions, prop, Severity } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
@ObjectType()
export class ErrorLog {
  @Field()
  _id: string;

  @Field({ nullable: true })
  @prop()
  subject?: string;

  @Field({ nullable: true })
  @prop()
  errorMessage?: string;

  @Field({ nullable: true })
  @prop()
  stackTrace?: string;

  @Field()
  @prop({default: Date.now, required: true})
  createdAt: Date;
}

export const ErrorLogModel = getModelForClass(ErrorLog);
