import cron from 'node-cron';
import { Tasks } from './tasks';
import { TaskModel } from './../../tasks/model/task.schema';
import mongoose from 'mongoose';

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
    const lockId = new mongoose.Types.ObjectId().toString(); // Unique lock ID for this instance
    const lockExpiration = new Date(Date.now() + 5 * 60 * 1000); // Lock expires in 5 minutes

    try {
      const result = await TaskModel.updateOne(
        { isCronRunning: { $ne: true }, lockExpiresAt: { $lt: new Date() } },  // Ensure the previous lock is expired
        { $set: { isCronRunning: true, lockId, lockExpiresAt: lockExpiration } },
        { upsert: false }
      ).exec();

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error while acquiring cron job lock:', error);
      return false;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await TaskModel.updateOne(
        { isCronRunning: true },
        { $set: { isCronRunning: false, lockExpiresAt: new Date(0) } }
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
      cron.schedule('*/2 * * * *', () => {
        this.processQuestionSummaryWithLock();
      });
    } else {
      console.log('Interview cron job is disabled.');
    }
  }
}
