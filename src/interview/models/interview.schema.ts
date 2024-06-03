import {index, modelOptions, prop, Severity} from '@typegoose/typegoose';
import {Field, ObjectType, registerEnumType} from 'type-graphql';

export enum InterviewStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
}

registerEnumType(InterviewStatus, {
  name: 'InterviewStatus',
});


@ObjectType({description: 'A user looking to hire on zwilt'})
@index({user: 1})
@modelOptions({options: {allowMixed: Severity.ALLOW}})
export class InterviewResponse {
  @Field()
  _id: string;

  @Field()
  @prop()
  guest: string;

  @Field()
  @prop({default: InterviewStatus.PENDING, required: true})
  status: InterviewStatus;

  @Field()
  @prop({default: Date.now, required: true})
  createdAt: Date;
}
