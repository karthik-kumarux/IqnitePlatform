import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionController {
    private readonly questionService;
    constructor(questionService: QuestionService);
    create(req: any, createQuestionDto: CreateQuestionDto): Promise<{
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
    bulkCreate(req: any, body: {
        quizId: string;
        questions: CreateQuestionDto[];
    }): Promise<{
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
    update(req: any, id: string, updateQuestionDto: UpdateQuestionDto): Promise<{
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
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
