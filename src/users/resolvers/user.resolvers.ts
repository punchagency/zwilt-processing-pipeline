import {Service} from 'typedi';
import {Query, Resolver, Authorized} from 'type-graphql';

@Resolver()
@Service()
export default class UserResolver {
  constructor() {}
  @Authorized()
  @Query(() => Boolean)
  async getUser() {
    return false;
  }
}
