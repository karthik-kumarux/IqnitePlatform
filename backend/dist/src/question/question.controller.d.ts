import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionController {
    private readonly questionService;
    constructor(questionService: QuestionService);
    create(req: any, createQuestionDto: CreateQuestionDto): Promise<{
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
    }>;
    bulkCreate(req: any, body: {
        quizId: string;
        questions: CreateQuestionDto[];
    }): Promise<{
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
    }[]>;
    findByQuiz(quizId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
        quiz: {
            id: string;
            title: string;
            organizerId: string;
        };
    } & {
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
    }>;
    update(req: any, id: string, updateQuestionDto: UpdateQuestionDto): Promise<{
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
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
