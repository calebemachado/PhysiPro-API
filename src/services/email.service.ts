import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/model';
import { AppError } from '../utils/app-error';

// Get email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@physipro.com';

// Create a transporter for sending emails
const transporter = process.env.NODE_ENV === 'test'
  ? nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal_pass'
      }
    })
  : nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

/**
 * Send an email
 * @param options Email sending options (to, subject, text, html)
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // If no email configuration in production, log warning and return
    if (process.env.NODE_ENV === 'production' && (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS)) {
      console.warn('Email service not configured. Skipping email sending.');
      return;
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent: %s', info.messageId);
    }
    
    // Preview only available when sending through Ethereal email
    if (process.env.NODE_ENV === 'test') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError(`Failed to send email: ${(error as Error).message}`, 500);
  }
}; 