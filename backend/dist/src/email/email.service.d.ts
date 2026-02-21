import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendOtpEmail(email: string, otp: string, username: string): Promise<void>;
    sendWelcomeEmail(email: string, username: string): Promise<void>;
}
