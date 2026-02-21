import { QuestionType } from '@prisma/client';
export declare class CreateQuestionDto {
    quizId: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer: string;
    points?: number;
    timeLimit?: number;
    order?: number;
    explanation?: string;
    imageUrl?: string;
    videoUrl?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    tags?: string[];
    isActive?: boolean;
}
