declare class GuestAnswerDto {
    questionId: string;
    answer: string;
    pointsEarned: number;
}
export declare class SubmitGuestQuizDto {
    quizId: string;
    guestName: string;
    sessionId: string;
    score: number;
    totalPoints: number;
    timeSpent?: number;
    answers: GuestAnswerDto[];
}
export {};
