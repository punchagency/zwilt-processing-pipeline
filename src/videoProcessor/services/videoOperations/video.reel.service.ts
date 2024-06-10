import { Service } from 'typedi';
import VideoProcessorModel from '../../../videoProcessor/models/videoProcessor.model';
import { pickOneFromEachCategory } from '../../../utilities/interviewHelper';
import { VIDEO_OPERATION_TYPE } from '../enum';

@Service()
class VideoReelService {
  async processVideoReel() {
    const interviewAssessment = await VideoProcessorModel.getInterviewAssessmentToProcess();
    if(interviewAssessment){
        const filteredInterviewAssessment = pickOneFromEachCategory(interviewAssessment.categories);
        const extractedLinks = filteredInterviewAssessment.map((item: any) => item.response.video_link);
         await VideoProcessorModel.downloadVideosLocally(VIDEO_OPERATION_TYPE.VIDEO_REEL, extractedLinks);
        const result = await VideoProcessorModel.generateVideoReel(interviewAssessment?._id, filteredInterviewAssessment, extractedLinks);
        return result;
    }
    return null;
  }
}
export default VideoReelService;
