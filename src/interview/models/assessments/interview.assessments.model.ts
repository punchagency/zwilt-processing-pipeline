import {getModelForClass} from '@typegoose/typegoose';
import {InterviewAssessment} from './interview.assessments.schema'

const InterviewAssessmentModel = getModelForClass(InterviewAssessment);

export default InterviewAssessmentModel;