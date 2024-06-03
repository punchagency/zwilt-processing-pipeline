import {GraphQLError} from 'graphql';
import {Inject, Service} from 'typedi';
import {OpenAIService} from '../../utilities/openAi/OpenAIService';

@Service()
export default class ClientInterviewService {
  @Inject()
  openAIService: OpenAIService;


  async initFxn() {
    try {
     
    } catch (error) {
      throw new GraphQLError(error);
    }
  }
}
