import { Tasks } from './tasks';
import cron from 'node-cron';

export class BackgroundTask extends Tasks {
  start() {
    cron.schedule('*/10 * * * * *', () => {
      this.TestTask();
    });

    cron.schedule('*/10 * * * *', () => {  // execute every 10 minutes
      this.processTopkeywords();
    });

    cron.schedule('*/10 * * * *', () => {  // execute every 10 minutes
      this.processTranscriptSummary();
    });

    cron.schedule('*/15 * * * *', () => {  // execute every 15 minutes
      this.processQuestionSummary();
    });

    cron.schedule('*/10 * * * *', () => {
      this.processInterviewProfilePicture();
    });

    cron.schedule('*/20 * * * *', () => {  // execute every 20 minutes
      // this.processVideoTranscribe();
    });

    cron.schedule('*/30 * * * *', () => {  // execute every 30 minutes
      this.processVideoReels();
    });
  }
}
