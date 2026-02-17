import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitGuestQuizDto } from './dto/submit-guest-quiz.dto';
export declare class QuizService {
    private prisma;
    constructor(prisma: PrismaService);
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
        scheduledAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        status: import("@prisma/client").$Enums.QuizStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(organizerId?: string, isPublic?: boolean): Promise<({
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
        scheduledAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        status: import("@prisma/client").$Enums.QuizStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
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
            createdAt: Date;
            updatedAt: Date;
            question: string;
            quizId: string;
            order: number;
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue | null;
            correctAnswer: string;
            points: number;
            timeLimit: number | null;
            explanation: string | null;
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
        scheduledAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        status: import("@prisma/client").$Enums.QuizStatus;
        createdAt: Date;
        updatedAt: Date;
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
        scheduledAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        status: import("@prisma/client").$Enums.QuizStatus;
        createdAt: Date;
        updatedAt: Date;
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
        scheduledAt: Date | null;
        expiresAt: Date | null;
        isActive: boolean;
        status: import("@prisma/client").$Enums.QuizStatus;
        createdAt: Date;
        updatedAt: Date;
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
        question: string;
        quizId: string;
        order: number;
        type: import("@prisma/client").$Enums.QuestionType;
        options: import("@prisma/client/runtime/client").JsonValue;
        correctAnswer: string;
        points: number;
        timeLimit: number | null;
        explanation: string | null;
    }[]>;
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
}
