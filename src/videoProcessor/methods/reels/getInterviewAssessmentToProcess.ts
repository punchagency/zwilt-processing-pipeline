import { AssessmentCategory } from './../../../interview/models/assessments/assessment.category.schema';
import {ReturnModelType} from '@typegoose/typegoose';
import VideoProcessor from '../../models/videoProcessor.schema';
import InterviewAssessmentModel from '../../../interview/models/assessments/interview.assessments.model';
import { AssessmentResponse } from '../../../interview/models/assessments/assessment.response.schema';


export default async function getInterviewAssessmentToProcess(
    _videoProcessor: ReturnModelType<typeof VideoProcessor>,
    _type?: string,
  ){
    let hasMore = true;
    let lastId = null;
  
    while (hasMore) {
      const query: any = {
        $or: [
          { 'interviewReel.noOfVideosUsedForReel': { $lt: 4 } },
          { 'interviewReel.noOfVideosUsedForReel': { $exists: false } }
        ]
      };
  
      if (lastId) {
        query._id = { $gt: lastId };
      }
  
      const interviewAssessment = await InterviewAssessmentModel.findOne(query)
        .populate({
          path: 'categories',
          model: 'AssessmentCategory',
          populate: {
            path: 'assessmentResponse',
            model: 'AssessmentResponse',
          },
        })
        .lean()
        .exec();
  
      if (!interviewAssessment) {
        hasMore = false;
        console.log('No more interview assessments to process.');
        break;
      }
  
      lastId = interviewAssessment._id;
      console.log(`Processing InterviewAssessment with _id: ${lastId}`);
  
      // Check if any assessmentResponse has at least 2 transcript records
      const categories = interviewAssessment.categories as AssessmentCategory[];
      let matchFound = false;
  
      for (const category of categories) {
        const responses = category.assessmentResponse as AssessmentResponse[];
        for (const response of responses) {
          if (response.transcript && response.transcript.words.length >= 2) {
            console.log('Match found.');
            return interviewAssessment;
          }
        }
      }
  
      if (!matchFound) {
        console.log('No match found, continuing to next interview assessment.');
      }
    }
  
    return null;
  }