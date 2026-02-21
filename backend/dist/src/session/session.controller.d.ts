import { SessionService } from './session.service';
import { StartQuizDto } from './dto/start-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    startQuiz(req: any, startQuizDto: StartQuizDto): Promise<{
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
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
            order: number;
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
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
            order: number;
        }[];
    }>;
    submitAnswer(req: any, sessionId: string, submitAnswerDto: SubmitAnswerDto): Promise<{
        correctAnswer?: string | undefined;
        explanation?: string | null | undefined;
        answerId: string;
        isCorrect: boolean;
        pointsEarned: number;
    }>;
    completeQuiz(req: any, sessionId: string): Promise<{
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
    getSession(req: any, sessionId: string): Promise<{
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
            type: import("@prisma/client").$Enums.QuestionType;
            options: import("@prisma/client/runtime/client").JsonValue;
            points: number;
            timeLimit: number | null;
            order: number;
        }[];
        answeredQuestions: {
            answer: string;
            questionId: string;
            pointsEarned: number;
            isCorrect: boolean;
        }[];
    }>;
    getMyResults(req: any): Promise<{
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
}
