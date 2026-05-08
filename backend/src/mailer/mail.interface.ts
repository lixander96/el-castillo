import { Address } from 'nodemailer/lib/mailer';
import Mail from 'nodemailer/lib/mailer';

export type SendEmailDto = {
  recipients: Address[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Mail.Attachment[];
};
