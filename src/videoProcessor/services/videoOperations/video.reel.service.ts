import { Service } from 'typedi';
import VideoProcessorModel from '../../../videoProcessor/models/videoProcessor.model';
import { pickOneFromEachCategory } from '../../../utilities/interviewHelper';
import { VIDEO_OPERATION_TYPE } from '../enum';
import { generateVideoReelTest } from './video.reel.service.init';


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
  
  async testProcessVideoReel() {    
    const videoLinks = ["https://zwilt.s3.amazonaws.com/mAiiSINo_16952049601571.mp4", "https://zwilt.s3.amazonaws.com/sfyCcI4l_16952052294213.mp4"];
         await VideoProcessorModel.downloadVideosLocally(VIDEO_OPERATION_TYPE.VIDEO_REEL, videoLinks);
         const result = await generateVideoReelTest();
        return result;
  }
}
export default VideoReelService;
