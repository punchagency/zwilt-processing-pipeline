import { ReturnModelType, mongoose } from '@typegoose/typegoose';
import { InterviewAssessment } from '../interview.assessments.schema';

export default async function updateAssessmentContactStatus(
    interviewAssessmentModel: ReturnModelType<typeof InterviewAssessment>,
    interviewAssessmentId: string,
  ) {
    try {
      const result = await interviewAssessmentModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(interviewAssessmentId),
        { $set: { contacted: true } },
        { new: true }
      );
      return result;
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  }