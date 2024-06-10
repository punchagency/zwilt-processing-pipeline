import { Tasks } from './tasks';
import cron from 'node-cron';

export class BackgroundTask extends Tasks {
  start() {
    cron.schedule('*/10 * * * * *', () => {
      this.TestTask();
    });

    cron.schedule('*/5 * * * *', () => {

    });
  }
}