import { Service } from 'typedi';
import { TaskModel } from './model/task.schema';

@Service()
export default class TaskService {
  public async updateInterviewCronState(shouldRunInterviewCron: boolean) {
    try {
         await TaskModel.create({shouldRunInterviewCron})
        console.log('Interview cron state created successfully');
    } catch (error) {
      console.error('Error while updating interview cron state:', error);
    }
  }
}
