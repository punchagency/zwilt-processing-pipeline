import cron from "node-cron";
import { Tasks } from "./tasks";
import { TaskModel } from "./../../tasks/model/task.schema";

export class BackgroundTask extends Tasks {
  private async shouldRunInterviewCron(): Promise<boolean> {
    try {
      const task = await TaskModel.findOne(
        {},
        { shouldRunInterviewCron: 1 }
      ).lean();
      return task?.shouldRunInterviewCron ?? false;
    } catch (error) {
      console.error("Error while fetching interview cron state:", error);
      return false;
    }
  }

  public async start() {
    if (await this.shouldRunInterviewCron()) {
      // cron.schedule('*/10 * * * * *', () => {
      //  this.TestTask()
      // });

      cron.schedule("*/10 * * * *", () => {
        // execute every 10 minutes
        this.processTopkeywords();
      });

      cron.schedule("*/10 * * * *", () => {
        // execute every 10 minutes
        this.processTranscriptSummary();
      });

      cron.schedule("*/15 * * * *", () => {
        // execute every 15 minutes
        this.processQuestionSummary();
      });

      cron.schedule("*/15 * * * *", () => {
        // execute every 20 minutes
        this.downloadAndProcessVideoTranscribe();
      });

      cron.schedule("*/30 * * * *", () => {
        // execute every 30 minutes
        this.processVideoReels();
      });

      // cron.schedule('*/15 * * * *', () => {  // execute every 20 minutes
      //   this.processVideoTranscribe();
      // });
    } else {
      console.log("Interview cron job is disabled.");
    }
  }
}
