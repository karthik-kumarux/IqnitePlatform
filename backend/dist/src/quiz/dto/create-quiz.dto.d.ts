export declare class CreateQuizDto {
    title: string;
    description?: string;
    isPublic?: boolean;
    duration?: number;
    passingScore?: number;
    maxAttempts?: number;
    showAnswers?: boolean;
    shuffleQuestions?: boolean;
    scheduledAt?: string;
    expiresAt?: string;
}
