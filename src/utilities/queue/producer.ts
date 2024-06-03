import { redisOptions } from './../../config/redis-config';
import { Queue } from 'bullmq';
import { audioGenerationQueueName } from './types';

const audioGenerationQueue = new Queue(audioGenerationQueueName, {
  connection: redisOptions,
});

export async function addBackgroundJob(jobName: string,  input: any ) {
  console.log("adding job to background...");
  try {
    if (jobName === 'textToSpeech') {
      await audioGenerationQueue.add(jobName, input);
      await audioGenerationQueue.close();
    }
  } catch (error) {
    console.error("Error adding job to background:", error);
    throw error; 
  }
}
