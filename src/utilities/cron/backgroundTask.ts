import cron from 'node-cron';
import { Tasks } from './tasks';
import { TaskModel } from './../../tasks/model/task.schema';

export class BackgroundTask extends Tasks {
  private async shouldRunInterviewCron(): Promise<boolean> {
    try {
      const task = await TaskModel.findOne({}, { shouldRunInterviewCron: 1 }).lean();
      return task?.shouldRunInterviewCron ?? false;
    } catch (error) {
      console.error('Error while fetching interview cron state:', error);
      return false;
    }
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const result = await TaskModel.updateOne(
        { isCronRunning: { $ne: true } },  // Only update if isCronRunning is not true
        { $set: { isCronRunning: true } },
        { upsert: false }  // Don't create a new document if one doesn't exist
      ).exec();

      return result.modifiedCount === 1;  // Returns true if a document was modified
    } catch (error) {
      console.error('Error while acquiring cron job lock:', error);
      return false;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await TaskModel.updateOne(
        { isCronRunning: true },
        { $set: { isCronRunning: false } }
      ).exec();
    } catch (error) {
      console.error('Error while releasing cron job lock:', error);
    }
  }

  private async processQuestionSummaryWithLock() {
    if (await this.acquireLock()) {
      try {
        await this.processQuestionSummary();
      } finally {
        await this.releaseLock();
      }
    } else {
      console.log('Another instance is already processing.');
    }
  }

  public async start() {
    if (await this.shouldRunInterviewCron()) {
      cron.schedule('*/2 * * * *', () => {  // execute every 5 minutes
        this.processQuestionSummaryWithLock();
      });
    } else {
      console.log('Interview cron job is disabled.');
    }
  }
}
