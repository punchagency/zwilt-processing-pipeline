import {Field, InputType} from 'type-graphql';

@InputType()
export class UserDataOAuthInput {
  @Field()
  name?: string;

  @Field({nullable: false})
  email: string;

  @Field({nullable: false})
  isTalentProfile: boolean;
}

@InputType()
export class UserDataInput {
  @Field()
  name?: string;

  @Field({nullable: false})
  email: string;

  @Field()
  password?: string;

  @Field({nullable: true})
  isTalentProfile: boolean;

  @Field({nullable: true})
  stripeCustomerId: string;

  @Field(() => [String])
  roles?: string[];

  @Field()
  firstName?: string;

  @Field()
  lastName?: string;
}

@InputType()
export class LocationInput {
  @Field()
  continent?: string;

  @Field()
  country?: string;

  @Field()
  city?: string;

  @Field()
  ipAddress?: string;

  @Field()
  postalCode?: string;

  @Field()
  timeZone?: string;

  @Field()
  contactNumber?: string;

  @Field(() => [Number])
  coordinates?: number[];
}

@InputType()
export class LoginInput {
  @Field({nullable: false})
  email: string;

  @Field({nullable: false})
  password: string;

  // @Field({nullable: false})
  // prefersClient: boolean;
}

@InputType()
export class verifyMailInput {
  @Field()
  resetToken: string;
  @Field()
  userId: string;
}

@InputType()
export class NotificationPreferrencesUpdateInput {
  @Field({nullable: false})
  messages: boolean;

  @Field({nullable: false})
  transactions: boolean;

  @Field({nullable: false})
  addedToTeam: boolean;

  @Field({nullable: false})
  removedFromTeam: boolean;

  @Field({nullable: false})
  contractUpdates: boolean;

  @Field({nullable: false})
  importantActivity: boolean;
}

@InputType()
export class UpdateUserWalletInput {
  @Field()
  userId: string;
  @Field()
  walletId: string;
}

@InputType()
export class CreateReviewInput {
  @Field()
  receiver: string;

  @Field()
  description: string;

  @Field()
  numberOfStars: number;
}
