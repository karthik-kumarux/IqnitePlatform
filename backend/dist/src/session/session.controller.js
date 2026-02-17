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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const start_quiz_dto_1 = require("./dto/start-quiz.dto");
const submit_answer_dto_1 = require("./dto/submit-answer.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SessionController = class SessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    startQuiz(req, startQuizDto) {
        return this.sessionService.startQuiz(req.user.id, startQuizDto.quizId);
    }
    submitAnswer(req, sessionId, submitAnswerDto) {
        return this.sessionService.submitAnswer(sessionId, req.user.id, submitAnswerDto);
    }
    completeQuiz(req, sessionId) {
        return this.sessionService.completeQuiz(sessionId, req.user.id);
    }
    getSession(req, sessionId) {
        return this.sessionService.getSession(sessionId, req.user.id);
    }
    getMyResults(req) {
        return this.sessionService.getMyResults(req.user.id);
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_quiz_dto_1.StartQuizDto]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "startQuiz", null);
__decorate([
    (0, common_1.Post)(':sessionId/answer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, submit_answer_dto_1.SubmitAnswerDto]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Post)(':sessionId/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "completeQuiz", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)('my/results'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "getMyResults", null);
exports.SessionController = SessionController = __decorate([
    (0, common_1.Controller)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map