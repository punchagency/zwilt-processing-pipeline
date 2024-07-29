import {Service} from 'typedi';
import errorMailer from '../utilities/mailer/mailTemplates/errorMailer';
import { ErrorLogModel } from './model/error.log.schema';
import VideoProcessorModel from '../videoProcessor/models/videoProcessor.model';
import updateVideoError from '../videoProcessor/methods/updateVideoError';

@Service()
export default class ErrorLogService {

  async logAndNotifyError(serviceName: string, error: any, videoLink?: any) {
    const subject = `Zwilt Processing Pipeline error at-: ${serviceName}`;
    const receiver = 'hafeezkhalid212@gmail.com';

    try {
      await ErrorLogModel.create({
        subject,
        serviceName,
        errorMessage: error.message ?? error.toString(),
        stackTrace: error.stack,
      });

      if(videoLink){
        await updateVideoError(VideoProcessorModel, videoLink,  error.message ?? error.toString());
      }
      
      const mail = new errorMailer();
      await mail.notifyErrorMailer(receiver, subject, serviceName, error);
      console.log('Error logged and email sent successfully');
    } catch (error) {
      console.error('Error while logging or sending email:', error);
    }
  }
}