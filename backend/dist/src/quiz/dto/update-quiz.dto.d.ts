import { CreateQuizDto } from './create-quiz.dto';
declare enum QuizStatus {
    DRAFT = "DRAFT",
    WAITING = "WAITING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}
declare const UpdateQuizDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateQuizDto>>;
export declare class UpdateQuizDto extends UpdateQuizDto_base {
    isActive?: boolean;
    status?: QuizStatus;
}
export {};
