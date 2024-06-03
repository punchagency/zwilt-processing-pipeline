import {ReturnModelType} from '@typegoose/typegoose';
import {InterviewAssessment} from '../interview.assessments.schema';

export default async function getCompletedInterviewProfiles(
  interviewAssessmentModel: ReturnModelType<typeof InterviewAssessment>,
  _user: string,
  organization: string,
  offset: number,
  limit: number
) {
  try {
    const completedInterviews = await interviewAssessmentModel
      .find({status: 'Completed', organization})
      .sort({createdAt: -1})
      .skip(offset)
      .limit(limit)
      .populate([
        {
          path: 'user',
          model: 'User',
        },
        {
          path: 'organization',
          model: 'Organization',
        },
        {
          path: 'categories',
          model: 'AssessmentCategory',
          populate: {
            path: 'assessmentResponse',
            model: 'AssessmentResponse',
          },
        },
      ])
      .lean()
      .exec();

    return completedInterviews;
  } catch (error) {
    console.error('Error fetching completed interview profiles:', error);
    throw error;
  }
}
