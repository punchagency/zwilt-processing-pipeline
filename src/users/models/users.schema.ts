import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Severity,
} from '@typegoose/typegoose';
import { Field } from 'type-graphql';



@index({ name: 'text' })
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
class User {
  @Field()
  _id: string;

  @Field()
  @prop({
    set: (val: string) =>
      val
        .split(' ')
        .map(item => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' '),
    get: (val: string) => val,
  })
  name: string;

  @Field()
  @prop({ required: true })
  email: string;

  @Field()
  @prop()
  profile_img: string;
}

export default User;

export const UserModel = getModelForClass(User);