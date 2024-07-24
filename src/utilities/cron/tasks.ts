import { VIDEO_OPERATION_TYPE } from './../../videoProcessor/services/enum';
import { Service } from "typedi";
import { getQuestionsFromDatabase } from "../../videoProcessor/services/interviewDataOperations/question.summary.service";
import { generateTalentTopKeywords } from './../../videoProcessor/services/interviewDataOperations/topkeywords.generate.service';
import { getTranscriptsFromDatabase } from "../../videoProcessor/services/interviewDataOperations/transcript.summary.service";
import VideoReelService from "../../videoProcessor/services/videoOperations/video.reel.service";
import { fetchVideosToProcess } from '../../videoProcessor/services/videoOperations/video.download.service';
import { saveProfilePicture } from '../../videoProcessor/services/videoOperations/video.profile.service';

@Service()
export class Tasks {
  private videoReelService: VideoReelService;

  constructor() {
    this.videoReelService = new VideoReelService();
  }
  async TestTask() {
    //
    // console.log("Task is running...");
  }
  async processQuestionSummary() {
    await getQuestionsFromDatabase();
  }

  async processTopkeywords() {
    await generateTalentTopKeywords();
  }

  async processTranscriptSummary() {
    await getTranscriptsFromDatabase();
  }
  
  async processVideoReels() {
    await this.videoReelService.processVideoReel();
  }

  async processVideoTranscribe() {
    await fetchVideosToProcess(VIDEO_OPERATION_TYPE.TRANSCRIBE);
  }

  async processInterviewProfilePicture() {
    await saveProfilePicture();
  }

}