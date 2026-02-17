import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JoinQuizDto } from './dto/join-quiz.dto';
import { JoinLobbyDto } from './dto/join-lobby.dto';
import { SubmitGuestQuizDto } from './dto/submit-guest-quiz.dto';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    create(req: any, createQuizDto: CreateQuizDto): Promise<{
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
    findAll(req: any, myQuizzes?: string, isPublic?: string): Promise<({
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
    getQuestions(id: string): Promise<{
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
    joinQuiz(joinQuizDto: JoinQuizDto): Promise<{
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
    joinQuizPublic(joinQuizDto: JoinQuizDto): Promise<{
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
    update(req: any, id: string, updateQuizDto: UpdateQuizDto): Promise<{
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
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    getStats(req: any, id: string): Promise<{
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
    submitGuestQuiz(submitGuestQuizDto: SubmitGuestQuizDto): Promise<{
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
    joinLobby(joinLobbyDto: JoinLobbyDto): Promise<{
        lobbyId: string;
        quizId: string;
        quizTitle: string;
        message: string;
    }>;
    getLobbyParticipants(id: string): Promise<{
        id: string;
        quizId: string;
        participantName: string;
        joinedAt: Date;
    }[]>;
    removeLobbyParticipant(lobbyId: string): Promise<{
        message: string;
    }>;
    startQuiz(req: any, id: string): Promise<{
        message: string;
        status: string;
    }>;
    getQuizStatus(id: string): Promise<{
        id: string;
        title: string;
        status: import("@prisma/client").$Enums.QuizStatus;
        code: string;
    }>;
    clearLobby(req: any, id: string): Promise<{
        message: string;
    }>;
}
