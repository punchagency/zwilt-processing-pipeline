import nodemailer from 'nodemailer';
import mailer from '@sendgrid/mail';
import {Mail} from './mailer.types';
import 'dotenv/config';
export default class Mailer {
  constructor() {
    mailer.setApiKey(String(process.env.SENDGRID_API_KEY));
  }
  transporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply@zwilt.com',
        pass: '************',
      },
      from: 'noreply@zwilt.com',
      //disable certificate verification
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(mailOptions: mailer.MailDataRequired) {
    try {
      await mailer.send(mailOptions);
    } catch (error) {
      console.log(error);
      throw Error('unable to send mail');
    }
  }

  async sendMailViaGmail(mailOptions: Mail) {
    try {
      const transporter = this.transporter();
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }
}
