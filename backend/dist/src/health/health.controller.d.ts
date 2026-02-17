import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            api: string;
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        services: {
            database: string;
            api: string;
        };
        error: any;
    }>;
}
