import { Service } from 'typedi';
import {
  CreateInterviewGuestInput,
} from '../dto/inputs';

@Service()
class InterviewService {
  async createInterviewGuest(input: CreateInterviewGuestInput) {
    console.log(input);
  }
}
export default InterviewService;
