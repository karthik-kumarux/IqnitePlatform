import { AdminService } from './admin.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getSystemStats(): Promise<any>;
    getAllUsers(query: PaginationQueryDto, search?: string, role?: string, isActive?: string): Promise<{
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            _count: {
                sessions: number;
                quizzes: number;
            };
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserDetails(id: string): Promise<{
        _count: {
            quizzes: number;
            quizSessions: number;
        };
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            avatar: string | null;
            bio: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            country: string | null;
            zipCode: string | null;
        } | null;
        quizzes: {
            id: string;
            title: string;
            code: string;
            createdAt: Date;
            _count: {
                questions: number;
                sessions: number;
            };
        }[];
        quizSessions: {
            quiz: {
                id: string;
                title: string;
            };
            id: string;
            score: number;
            totalPoints: number;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        verificationToken: string | null;
        verificationOtp: string | null;
        verificationOtpExpires: Date | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        lastLoginAt: Date | null;
    }>;
    createUser(createUserDto: CreateAdminUserDto): Promise<{
        message: string;
        user: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    deleteUser(id: string): Promise<{
        message: string;
        errorCode: null;
    }>;
    updateUserRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            username: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        errorCode: null;
    }>;
    updateUserStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<{
        message: string;
        user: {
            id: string;
            isActive: boolean;
            email: string;
            username: string;
        };
        errorCode: null;
    }>;
    bulkUpdateUserRole(userIds: string[], role: string): Promise<{
        message: string;
        errorCode: null;
    }>;
    bulkUpdateUserStatus(userIds: string[], isActive: boolean): Promise<{
        message: string;
        errorCode: null;
    }>;
    getAllQuizzes(page?: string, limit?: string): Promise<{
        data: ({
            organizer: {
                id: string;
                email: string;
                username: string;
            };
            _count: {
                questions: number;
                sessions: number;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            organizerId: string;
            code: string;
            isPublic: boolean;
            duration: number | null;
            passingScore: number | null;
            maxAttempts: number;
            showAnswers: boolean;
            shuffleQuestions: boolean;
            randomizeOptions: boolean;
            enableAdaptiveDifficulty: boolean;
            questionPoolSize: number | null;
            questionPoolTags: string[];
            scheduledAt: Date | null;
            expiresAt: Date | null;
            isActive: boolean;
            isArchived: boolean;
            status: import("@prisma/client").$Enums.QuizStatus;
            createdAt: Date;
            updatedAt: Date;
            archivedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecentActivity(limit?: string): Promise<({
        type: "quiz_created";
        timestamp: Date;
        user: string;
        details: string;
    } | {
        type: "quiz_completed";
        timestamp: Date;
        user: string;
        details: string;
    })[]>;
    getAdvancedAnalytics(): Promise<{
        userGrowth: {
            date: string;
            count: number;
        }[];
        quizGrowth: {
            date: string;
            count: number;
        }[];
        sessionGrowth: {
            date: string;
            count: number;
        }[];
        topOrganizers: {
            id: string;
            username: string;
            quizzesCreated: number;
        }[];
        topParticipants: {
            id: string;
            username: string;
            quizzesTaken: number;
        }[];
        averagePerformance: {
            avgScore: number;
            avgPercentage: number;
            avgTimeSpent: number;
            totalCompletedSessions: number;
        };
    }>;
    getAuditLogs(query: PaginationQueryDto): Promise<{
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
    deleteQuiz(id: string, adminId: string): Promise<{
        message: string;
        errorCode: null;
    }>;
    transferQuizOwnership(quizId: string, newOrganizerId: string, adminId: string): Promise<{
        message: string;
        errorCode: null;
    }>;
}
