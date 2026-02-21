import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitGuestQuizDto } from './dto/submit-guest-quiz.dto';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { ExportQuizzesDto } from './dto/export-quiz.dto';
import { QuizGateway } from './quiz.gateway';
export declare class QuizService {
    private prisma;
    private quizGateway;
    constructor(prisma: PrismaService, quizGateway: QuizGateway);
    private generateQuizCode;
    create(organizerId: string, createQuizDto: CreateQuizDto): Promise<{
        organizer: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    findAll(organizerId?: string, isPublic?: boolean, includeArchived?: boolean, page?: number, limit?: number): Promise<{
        data: ({
            organizer: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
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
    findOne(id: string): Promise<{
        organizer: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        };
        questions: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            question: string;
            quizId: string;
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string;
            points: number;
            timeLimit: number | null;
            order: number;
            explanation: string | null;
            imageUrl: string | null;
            videoUrl: string | null;
            difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
            tags: string[];
        }[];
        _count: {
            sessions: number;
            guestSessions: number;
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
    }>;
    findByCode(code: string): Promise<{
        organizer: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    update(id: string, organizerId: string, updateQuizDto: UpdateQuizDto): Promise<{
        organizer: {
            id: string;
            email: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    remove(id: string, organizerId: string): Promise<{
        message: string;
    }>;
    getQuizStats(id: string, organizerId: string): Promise<{
        quiz: {
            id: string;
            title: string;
            code: string;
        };
        stats: {
            totalParticipants: number;
            completed: number;
            inProgress: number;
            averageScore: number;
            averagePercentage: number;
        };
        leaderboard: {
            rank: number;
            participant: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
            score: number;
            totalPoints: number;
            percentage: number | null;
            timeSpent: number | null;
            completedAt: Date | null;
        }[];
    }>;
    getQuizQuestions(quizId: string): Promise<{
        id: string;
        isActive: boolean;
        question: string;
        quizId: string;
        type: import("@prisma/client").$Enums.QuestionType;
        options: import("@prisma/client/runtime/client").JsonValue;
        correctAnswer: string;
        points: number;
        timeLimit: number | null;
        order: number;
        explanation: string | null;
        imageUrl: string | null;
        videoUrl: string | null;
        difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
        tags: string[];
    }[]>;
    private shuffleArray;
    private randomizeQuestionOptions;
    joinLobby(participantName: string, quizCode: string): Promise<{
        lobbyId: string;
        quizId: string;
        quizTitle: string;
        message: string;
    }>;
    getLobbyParticipants(quizId: string): Promise<{
        id: string;
        quizId: string;
        participantName: string;
        joinedAt: Date;
    }[]>;
    removeLobbyParticipant(lobbyId: string): Promise<{
        message: string;
    }>;
    startQuiz(quizId: string, organizerId: string): Promise<{
        message: string;
        status: string;
    }>;
    getQuizStatus(quizId: string): Promise<{
        id: string;
        title: string;
        status: import("@prisma/client").$Enums.QuizStatus;
        code: string;
    }>;
    clearLobby(quizId: string): Promise<{
        message: string;
    }>;
    submitGuestQuiz(submitDto: SubmitGuestQuizDto): Promise<{
        message: string;
        session: {
            id: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            quizId: string;
            guestName: string;
            sessionId: string;
            score: number;
            totalPoints: number;
            timeSpent: number | null;
            percentage: number | null;
            startedAt: Date;
            completedAt: Date | null;
        };
    }>;
    getQuizStatsWithGuests(id: string, organizerId: string): Promise<{
        quiz: {
            id: string;
            title: string;
            code: string;
        };
        stats: {
            totalParticipants: number;
            completed: number;
            inProgress: number;
            averageScore: number;
            averagePercentage: number;
        };
        leaderboard: {
            rank: number;
            participant: {
                id: string;
                username: string;
                email: string;
                isGuest: boolean;
            };
            score: number;
            totalPoints: number;
            percentage: number | null;
            timeSpent: number | null;
            completedAt: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
        }[];
    }>;
    resetQuiz(quizId: string, organizerId: string): Promise<{
        message: string;
        status: string;
    }>;
    getActiveQuiz(organizerId: string): Promise<({
        _count: {
            questions: number;
            sessions: number;
            guestSessions: number;
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
    }) | null>;
    getRecentQuizzes(organizerId: string, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                questions: number;
                sessions: number;
                guestSessions: number;
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
    getQuizResults(quizId: string, organizerId: string): Promise<{
        quiz: {
            id: string;
            title: string;
            description: string | null;
            code: string;
            status: import("@prisma/client").$Enums.QuizStatus;
            createdAt: Date;
            updatedAt: Date;
        };
        statistics: {
            totalParticipants: number;
            completedCount: number;
            inProgressCount: number;
            totalQuestions: number;
            averageScore: number;
            averagePercentage: number;
        };
        participants: {
            id: string;
            name: string;
            email: string;
            type: string;
            score: number;
            totalPoints: number;
            percentage: number | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            startedAt: Date;
            completedAt: Date | null;
            timeSpent: number | null;
            answers: ({
                question: {
                    id: string;
                    question: string;
                    correctAnswer: string;
                    points: number;
                };
            } & {
                id: string;
                answer: string;
                questionId: string;
                pointsEarned: number;
                sessionId: string;
                isCorrect: boolean;
                answeredAt: Date;
            })[];
        }[];
    }>;
    bulkOperation(organizerId: string, bulkOperationDto: BulkOperationDto): Promise<{
        message: string;
        count: any;
    }>;
    exportQuizzes(organizerId: string, exportDto: ExportQuizzesDto): Promise<{
        filename: string;
        data: {
            version: string;
            exportedAt: string;
            organizerId: string;
            quizCount: number;
            quizzes: {
                id: undefined;
                organizerId: undefined;
                code: undefined;
                questions: {
                    id: undefined;
                    quizId: undefined;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    question: string;
                    type: import("@prisma/client").$Enums.QuestionType;
                    options: import("@prisma/client/runtime/client").JsonValue | null;
                    correctAnswer: string;
                    points: number;
                    timeLimit: number | null;
                    order: number;
                    explanation: string | null;
                    imageUrl: string | null;
                    videoUrl: string | null;
                    difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
                    tags: string[];
                }[];
                title: string;
                description: string | null;
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
            }[];
        };
    }>;
    importQuizzes(organizerId: string, backupData: any): Promise<{
        message: string;
        count: number;
        quizzes: {
            id: any;
            title: any;
            code: any;
            questionCount: any;
        }[];
    }>;
    archiveQuiz(quizId: string, organizerId: string): Promise<{
        message: string;
    }>;
    unarchiveQuiz(quizId: string, organizerId: string): Promise<{
        message: string;
    }>;
}
