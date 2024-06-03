import {Service} from 'typedi';
import {Mutation, Resolver, Authorized} from 'type-graphql';

@Resolver()
@Service()
export default class UserResolver {
  constructor() {}
  @Authorized()
  @Mutation(() => Boolean)
  async getUser() {
    return false;
  }
}
