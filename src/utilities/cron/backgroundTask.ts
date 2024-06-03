import { Tasks } from './tasks';
import cron from 'node-cron';

export class BackgroundTask extends Tasks {
  start() {
    cron.schedule('*/20 * * * * *', () => {
      this.TestTask();
    });

    cron.schedule('*/5 * * * *', () => {

    });
  }
}