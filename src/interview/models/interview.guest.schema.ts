import {
  index,
  modelOptions,
  prop,
  Severity,
} from '@typegoose/typegoose';
import {Field, ObjectType} from 'type-graphql';


@ObjectType({description: 'A user looking to hire on zwilt'})
@index({user: 1})
@modelOptions({
  schemaOptions: {timestamps: true},
  options: {allowMixed: Severity.ALLOW},
})
class Guest {
  @Field()
  _id: string;

  @Field()
  @prop({unique: true})
  email: string;

  @Field({nullable: true})
  @prop()
  name: string;

  @Field()
  @prop()
  country: string;

  @Field({nullable: true})
  @prop()
  city: string;

  @Field({nullable: true})
  @prop({unique: true})
  phone: string;
  
}
export default Guest;
