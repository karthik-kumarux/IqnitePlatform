import { CreateQuestionDto } from './create-question.dto';
declare const UpdateQuestionDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateQuestionDto, "quizId">>>;
export declare class UpdateQuestionDto extends UpdateQuestionDto_base {
}
export {};
