// import { cleanUpVideos } from './../../../videoProcessor/services/videoOperations/video.cleanup.service';
import { fetchVideosToProcess } from '../../../videoProcessor/services/videoOperations/video.download.service';
import { VIDEO_OPERATION_TYPE } from './../../../videoProcessor/services/enum';
import express from 'express';
import VideoReelService from '../../../videoProcessor/services/videoOperations/video.reel.service';
import { getTranscriptsFromDatabase } from '../../../videoProcessor/services/interviewDataOperations/transcript.summary.service';
import { generateTalentTopKeywords } from '../../../videoProcessor/services/interviewDataOperations/topkeywords.generate.service';
import { getQuestionsFromDatabase } from '../../../videoProcessor/services/interviewDataOperations/question.summary.service';
import { convertVideoToMP3 } from '../../../videoProcessor/services/audioOperations/video.to.audio.service';

const router = express.Router();
const videoReelService = new VideoReelService();

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
      const result = await videoReelService.testProcessVideoReel();
      // const result = await getTranscriptsFromDatabase();
      // const result = await generateTalentTopKeywords();
      // const result = await getQuestionsFromDatabase();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error generating video reel:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/processTopkeywords', async (_, res) => {
    try {
      const result = await generateTalentTopKeywords();
      // const result = await getTranscriptsFromDatabase();
      // const result = await generateTalentTopKeywords();
      // const result = await getQuestionsFromDatabase();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing top keywords:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/processTranscriptSummary', async (_, res) => {
    try {
      const result = await getTranscriptsFromDatabase();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing transcript summary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/processQuestionSummary', async (_, res) => {
    try {
      const result = await getQuestionsFromDatabase();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing question summary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/downloadAndProcessVideoTranscribe', async (_, res) => {
    try {
      const result = await fetchVideosToProcess(VIDEO_OPERATION_TYPE.TRANSCRIBE);
      // const result = await cleanUpVideos();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing interview videos:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/processVideoTranscribe', async (_, res) => {
    try {
      const result = await convertVideoToMP3()
      // const result = await cleanUpVideos();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing interview videos:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/processVideoReels', async (_, res) => {
    try {
      const result = await videoReelService.processVideoReel();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing interview reels:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

export default router;
