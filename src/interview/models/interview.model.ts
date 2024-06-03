import {getModelForClass} from '@typegoose/typegoose';
import { InterviewResponse } from './interview.schema';

const InterviewResponseModel = getModelForClass(InterviewResponse);

export default InterviewResponseModel;
