import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
} from 'type-graphql';
import {Service} from 'typedi';


@Service()
@Resolver()
export default class ClientInterviewResolver {
  constructor(
  ) {}

  // @Authorized()
  @Mutation(() => String)
  async submitInterviewQuestions(
    @Ctx('getUser')
    @Arg('input')
    input: string
  ) {
    return input;
  }
}
