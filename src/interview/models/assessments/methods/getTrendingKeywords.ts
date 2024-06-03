import { TrendingKeyword } from './../../../dto/returnTypes/interview-assessments';
import { ReturnModelType } from '@typegoose/typegoose';
import { InterviewAssessment } from '../interview.assessments.schema';
import { Types } from 'mongoose';

export default async function getTrendingKeywords(
  interviewAssessmentModel: ReturnModelType<typeof InterviewAssessment>,
  organization: string
): Promise<TrendingKeyword[]> {
  try {
    const organizationObjectId = new Types.ObjectId(organization);

    await interviewAssessmentModel.aggregate([
      { $match: { organization: organizationObjectId } },
    ]);

   await interviewAssessmentModel.aggregate([
      { $match: { organization: organizationObjectId } },
      { $unwind: '$topKeywords' },
    ]);

     await interviewAssessmentModel.aggregate([
      { $match: { organization: organizationObjectId } },
      { $unwind: '$topKeywords' },
      {
        $group: {
          _id: '$topKeywords.keyword',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = await interviewAssessmentModel.aggregate([
      { $match: { organization: organizationObjectId } },
      { $unwind: '$topKeywords' },
      {
        $group: {
          _id: '$topKeywords.keyword',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return result.map((item) => ({
      keyword: item._id,
      count: item.count,
    }));
  } catch (err) {
    console.error('Error getting trending keywords:', err);
    throw err;
  }
}
