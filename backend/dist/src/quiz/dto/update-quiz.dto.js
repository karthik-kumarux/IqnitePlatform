"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuizDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_quiz_dto_1 = require("./create-quiz.dto");
const class_validator_1 = require("class-validator");
var QuizStatus;
(function (QuizStatus) {
    QuizStatus["DRAFT"] = "DRAFT";
    QuizStatus["WAITING"] = "WAITING";
    QuizStatus["IN_PROGRESS"] = "IN_PROGRESS";
    QuizStatus["COMPLETED"] = "COMPLETED";
})(QuizStatus || (QuizStatus = {}));
class UpdateQuizDto extends (0, mapped_types_1.PartialType)(create_quiz_dto_1.CreateQuizDto) {
    isActive;
    status;
}
exports.UpdateQuizDto = UpdateQuizDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuizDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(QuizStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuizDto.prototype, "status", void 0);
//# sourceMappingURL=update-quiz.dto.js.map