import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get('EMAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, username: string) {
    const mailOptions = {
      from: `"IQnite Platform" <${this.configService.get('EMAIL_USER')}>`,
      to: email,
      subject: 'Verify Your Email - IQnite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #2c3e50; text-align: center;">Welcome to IQnite!</h1>
          <p style="font-size: 16px; color: #34495e;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 16px; color: #34495e;">Thank you for registering with IQnite. Please verify your email address by entering the OTP below:</p>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h2 style="color: #2c3e50; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          
          <p style="font-size: 14px; color: #7f8c8d;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #7f8c8d;">If you didn't request this, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="font-size: 12px; color: #95a5a6; text-align: center;">© 2026 IQnite Platform. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, username: string) {
    const mailOptions = {
      from: `"IQnite Platform" <${this.configService.get('EMAIL_USER')}>`,
      to: email,
      subject: 'Welcome to IQnite Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #2c3e50; text-align: center;">🎉 Welcome to IQnite!</h1>
          <p style="font-size: 16px; color: #34495e;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 16px; color: #34495e;">Your email has been successfully verified! You can now enjoy all the features of IQnite.</p>
          
          <div style="background: #27ae60; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">✓ Email Verified Successfully</p>
          </div>
          
          <p style="font-size: 16px; color: #34495e;">Get started by:</p>
          <ul style="font-size: 14px; color: #34495e;">
            <li>Creating your first quiz</li>
            <li>Joining live quiz sessions</li>
            <li>Exploring quiz analytics</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" style="background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="font-size: 12px; color: #95a5a6; text-align: center;">© 2026 IQnite Platform. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
    }
  }
}
