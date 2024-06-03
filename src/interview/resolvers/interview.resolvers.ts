import {Mutation, Resolver} from 'type-graphql';
import {Service} from 'typedi';

@Service()
@Resolver()
export default class InterviewResolver {
  constructor() {}

  @Mutation(() => Boolean)
  async submitInterviewResponses() {
    return;
  }
}
