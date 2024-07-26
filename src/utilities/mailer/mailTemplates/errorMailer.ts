import { mailCustomizer } from '../mailCustomizer';
import Mailer from '../mailer';
import { Mail } from '../mailer.types';

export default class errorMailer extends Mailer {
  private mailOptions: Mail;
  constructor() {
    super();
  }
  async notifyErrorMailer(
    receiver: string,
    subject: string,
    serviceName: string,
    error: any,
  ) {
    this.mailOptions = {
      from: 'noreply@zwilt.com',
      to: receiver,
      subject: subject,
      html: await mailCustomizer('./html/error-notify.html', {
        subject,
        serviceName,
        errorMessage: error?.message ?? error.toString(),
        stackTrace: error?.stack
    })
    };
    this.sendMail(this.mailOptions);
  }
}
