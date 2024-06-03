import {Query, Resolver} from 'type-graphql';
import {Service} from 'typedi';

@Service()
@Resolver()
export default class InterviewResolver {
  constructor() {}

  @Query(() => Boolean)
  async submitInterviewResponses() {
    return true;
  }
}
