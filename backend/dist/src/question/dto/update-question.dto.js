"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuestionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_question_dto_1 = require("./create-question.dto");
const mapped_types_2 = require("@nestjs/mapped-types");
class UpdateQuestionDto extends (0, mapped_types_1.PartialType)((0, mapped_types_2.OmitType)(create_question_dto_1.CreateQuestionDto, ['quizId'])) {
}
exports.UpdateQuestionDto = UpdateQuestionDto;
//# sourceMappingURL=update-question.dto.js.map