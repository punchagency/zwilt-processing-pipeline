import {Service} from 'typedi';
import errorMailer from '../utilities/mailer/mailTemplates/errorMailer';
import { ErrorLogModel } from './model/error.log.schema';

@Service()
export default class ErrorLogService {

  async logAndNotifyError(serviceName: string, error: any) {
    const subject = `Zwilt Processing Pipeline error at-: ${serviceName}`;
    const receiver = 'hafeezkhalid212@gmail.com';

    try {
      await ErrorLogModel.create({
        subject,
        serviceName,
        errorMessage: error.message ?? error.toString(),
        stackTrace: error.stack,
      });
      
      const mail = new errorMailer();
      await mail.notifyErrorMailer(receiver, subject, serviceName, error);
      console.log('Error logged and email sent successfully');
    } catch (error) {
      console.error('Error while logging or sending email:', error);
    }
  }
}