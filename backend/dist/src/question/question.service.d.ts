import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionService {
    private prisma;
    constructor(prisma: PrismaService);
    create(organizerId: string, createQuestionDto: CreateQuestionDto): Promise<{
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
    }>;
    findByQuiz(quizId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
        quiz: {
            id: string;
            title: string;
            organizerId: string;
        };
    } & {
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
    }>;
    update(id: string, organizerId: string, updateQuestionDto: UpdateQuestionDto): Promise<{
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
    }>;
    remove(id: string, organizerId: string): Promise<{
        message: string;
    }>;
    bulkCreate(organizerId: string, quizId: string, questions: CreateQuestionDto[]): Promise<{
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
    }[]>;
}
