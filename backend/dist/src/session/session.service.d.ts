import { PrismaService } from '../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
export declare class SessionService {
    private prisma;
    constructor(prisma: PrismaService);
    startQuiz(participantId: string, quizId: string): Promise<{
        session: {
            id: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            score: number;
            totalPoints: number;
            startedAt: Date;
            completedAt: Date | null;
        };
        quiz: {
            id: string;
            title: string;
            description: string | null;
            duration: number | null;
            questionCount: number;
        };
        questions: {
            id: string;
            question: string;
            order: number;
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
        }[];
        answeredQuestions: {
            answer: string;
            questionId: string;
            pointsEarned: number;
            isCorrect: boolean;
        }[];
    } | {
        session: {
            id: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            startedAt: Date;
        };
        quiz: {
            id: string;
            title: string;
            description: string | null;
            duration: number | null;
            totalPoints: number;
            questionCount: number;
        };
        questions: {
            id: string;
            question: string;
            order: number;
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
        }[];
    }>;
    submitAnswer(sessionId: string, participantId: string, submitAnswerDto: SubmitAnswerDto): Promise<{
        correctAnswer?: string | undefined;
        explanation?: string | null | undefined;
        answerId: string;
        isCorrect: boolean;
        pointsEarned: number;
    }>;
    completeQuiz(sessionId: string, participantId: string): Promise<{
        answers?: {
            questionId: string;
            question: string;
            yourAnswer: string;
            correctAnswer: string;
            isCorrect: boolean;
            pointsEarned: number;
            explanation: string | null;
        }[] | undefined;
        sessionId: string;
        score: number;
        totalPoints: number;
        percentage: number;
        passed: boolean;
        timeSpent: number;
        answeredQuestions: number;
        totalQuestions: number;
    }>;
    getSession(sessionId: string, participantId: string): Promise<{
        session: {
            id: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            score: number;
            totalPoints: number;
            startedAt: Date;
            completedAt: Date | null;
        };
        quiz: {
            id: string;
            title: string;
            description: string | null;
            duration: number | null;
            questionCount: number;
        };
        questions: {
            id: string;
            question: string;
            order: number;
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
        }[];
        answeredQuestions: {
            answer: string;
            questionId: string;
            pointsEarned: number;
            isCorrect: boolean;
        }[];
    }>;
    getMyResults(participantId: string): Promise<{
        sessionId: string;
        quiz: {
            id: string;
            title: string;
            description: string | null;
            passingScore: number | null;
        };
        score: number;
        totalPoints: number;
        percentage: number | null;
        passed: boolean;
        completedAt: Date | null;
        timeSpent: number | null;
    }[]>;
    private checkAnswer;
    private shuffleArray;
}
