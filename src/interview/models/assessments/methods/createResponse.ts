import { ReturnModelType } from '@typegoose/typegoose';
import { AssessmentResponse } from '../assessment.response.schema';
import {
  // questionResponseInput,
  CreateAssessmentResponseInput
} from 'interview/dto/interview.input';

export default async function createResponse(
  assessmentResponseModel: ReturnModelType<typeof AssessmentResponse>,
  input: CreateAssessmentResponseInput
) {
  let response;
  
  if (input.retaken) {
    response = await assessmentResponseModel.create(input);
    // todo find out what to do with the old one
    return {
      response,
      processVideo: true,
    };
  }

  response = await assessmentResponseModel.findOne({
    questionId: input.questionId,
    video_link: input.video_link,
  }).lean();

  if (!response) {
    response = await assessmentResponseModel.create(input);
    return {
      response,
      processVideo: true,
    };
  }

  return {
    processVideo: false,
    response
  };
}
