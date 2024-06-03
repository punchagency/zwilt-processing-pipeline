import { ReturnModelType, mongoose } from '@typegoose/typegoose';
import { InterviewAssessment } from '../interview.assessments.schema';

export default async function getAssesmentResponses(
  interviewAssessmentModel: ReturnModelType<typeof InterviewAssessment>,
  assessmentId: string
) {
  return interviewAssessmentModel.find(
    {
      _id: new mongoose.Types.ObjectId(assessmentId)
    }
  ).populate({
    path: 'categories',
    populate: {
      path: 'assessment',
      model: 'interviewAssessment'
    }
  }).populate({
    path: 'categories.response',
    model: 'assessmentResponse'
  })
}