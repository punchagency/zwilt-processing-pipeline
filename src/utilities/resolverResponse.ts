import {Field, ObjectType} from 'type-graphql';

@ObjectType()
export default class ResolverResponse {
  @Field()
  statusCode: number;
  @Field()
  success: string;
  @Field()
  message: string;
}
