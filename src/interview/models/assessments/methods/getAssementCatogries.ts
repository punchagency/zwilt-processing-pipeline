import { ReturnModelType, mongoose } from '@typegoose/typegoose';
import { InterviewAssessment } from '../interview.assessments.schema';
import { GetAssessmentCategoryInput } from '../../../dto/interview.input'

export default async function getAssessmentCategories(
  interviewAssessmentModel: ReturnModelType<typeof InterviewAssessment>,
  input: GetAssessmentCategoryInput
) {
  return interviewAssessmentModel.find({
    _id: new mongoose.Types.ObjectId(input.assessmentId)
  }
  ).populate('categories')
}