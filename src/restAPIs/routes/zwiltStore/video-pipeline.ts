import { fetchVideosToProcess } from '../../../videoProcessor/services/videoOperations/video.download.service';
import { VIDEO_OPERATION_TYPE } from './../../../videoProcessor/services/enum';
import express from 'express';
// import VideoReelService from '../../../videoProcessor/services/videoOperations/video.reel.service';
// import { getTranscriptsFromDatabase } from '../../../videoProcessor/services/interviewDataOperations/transcript.summary.service';
// import { generateTalentTopKeywords } from '../../../videoProcessor/services/interviewDataOperations/topkeywords.generate.service';
import { getQuestionsFromDatabase } from '../../../videoProcessor/services/interviewDataOperations/question.summary.service';

const router = express.Router();
// const videoReelService = new VideoReelService();

router.get('/execute-video-process', async (_, res) => {
    try {
    //   const result = await generateVideoReel(req, res);
      const result = await fetchVideosToProcess(VIDEO_OPERATION_TYPE.TRANSCRIBE);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error generating video reel:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/test', async (_, res) => {
    try {
    //   const result = await videoReelService.processVideoReel();
      // const result = await getTranscriptsFromDatabase();
      // const result = await generateTalentTopKeywords();
      const result = await getQuestionsFromDatabase();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error generating video reel:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

export default router;
