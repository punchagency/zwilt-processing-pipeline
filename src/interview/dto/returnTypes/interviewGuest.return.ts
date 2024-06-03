import {Field, ObjectType} from 'type-graphql';
import ResolverResponse from '../../../utilities/resolverResponse';

@ObjectType()
class RequestObject {
  @Field({nullable: true})
  requestId: string;

  @Field({nullable: true})
  guestId: string;
}

@ObjectType()
class VerifyObject {
  @Field()
  requestId: string;
  /**
   * The unique identifier for the Verify event.
   */
  @Field({nullable: true})
  eventId?: string;
  /**
   * The error message, if any, associated with the Verify Check.
   */
  @Field({nullable: true})
  errorText?: string;
  /**
   * The estimated price for the messages sent during the Verify Check.
   */
  @Field({nullable: true})
  estimatedPriceMessagesSent?: string;
}

@ObjectType()
export class SendVerificationResponse extends ResolverResponse {
  @Field()
  data: RequestObject;
}

@ObjectType()
export class CheckVerificationResponse extends ResolverResponse {
  @Field()
  data: VerifyObject;
}

@ObjectType()
export class VerifyOtpResponse  {
  @Field()
  guestId: string;
}
