import {Field, InputType} from 'type-graphql';

@InputType()
export class CreateInterviewGuestInput {
  @Field()
  name?: string;

  @Field()
  email?: string;

  @Field()
  phone?: string;

  @Field()
  city?: string;

  @Field()
  country?: string;
}

@InputType()
export class VerifyOTPInput {
  @Field()
  requestId: string;

  @Field()
  guestId: string;

  @Field()
  code: string;
}

@InputType()
export class guestUpdateInput {
  @Field()
  guestId: string;

  @Field()
  country: string;

  @Field()
  name: string;

  @Field()
  portfolio: string;
}
