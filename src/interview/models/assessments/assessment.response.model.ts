import { getModelForClass } from '@typegoose/typegoose';
import { AssessmentResponse } from './assessment.response.schema'

const AssessmentResponseModel = getModelForClass(AssessmentResponse);

export default AssessmentResponseModel;