import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: {
        userId: string;
        action: string;
        targetType?: string;
        targetId?: string;
        details?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        targetType: string | null;
        targetId: string | null;
        details: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    getRecentLogs(limit?: number, page?: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                username: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            action: string;
            targetType: string | null;
            targetId: string | null;
            details: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserLogs(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        targetType: string | null;
        targetId: string | null;
        details: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    getTargetLogs(targetType: string, targetId: string, limit?: number): Promise<({
        user: {
            id: string;
            username: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        targetType: string | null;
        targetId: string | null;
        details: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
