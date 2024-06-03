import {
  index,
  modelOptions,
  prop,
  Ref,
  Severity,
} from '@typegoose/typegoose';
import {Field, ObjectType} from 'type-graphql';
import User from '../../users/models/users.schema';

@ObjectType({description: 'A user looking to hire on zwilt'})
@index({user: 1})
@modelOptions({options: {allowMixed: Severity.ALLOW}})
class Client {
  @Field()
  _id: string;

  @Field(() => User, {description: "client's user information"})
  @prop({ref: () => User})
  user: Ref<User>;

  @Field()
  @prop({default: Date.now, required: true})
  createdAt: Date;
  
}

export default Client;
