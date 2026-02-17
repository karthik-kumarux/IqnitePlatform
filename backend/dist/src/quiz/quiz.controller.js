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
exports.QuizController = void 0;
const common_1 = require("@nestjs/common");
const quiz_service_1 = require("./quiz.service");
const create_quiz_dto_1 = require("./dto/create-quiz.dto");
const update_quiz_dto_1 = require("./dto/update-quiz.dto");
const join_quiz_dto_1 = require("./dto/join-quiz.dto");
const join_lobby_dto_1 = require("./dto/join-lobby.dto");
const submit_guest_quiz_dto_1 = require("./dto/submit-guest-quiz.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let QuizController = class QuizController {
    quizService;
    constructor(quizService) {
        this.quizService = quizService;
    }
    create(req, createQuizDto) {
        return this.quizService.create(req.user.id, createQuizDto);
    }
    findAll(req, myQuizzes, isPublic) {
        const organizerId = myQuizzes === 'true' ? req.user.id : undefined;
        const publicFilter = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
        return this.quizService.findAll(organizerId, publicFilter);
    }
    findOne(id) {
        return this.quizService.findOne(id);
    }
    async getQuestions(id) {
        const questions = await this.quizService.getQuizQuestions(id);
        return questions;
    }
    joinQuiz(joinQuizDto) {
        return this.quizService.findByCode(joinQuizDto.code);
    }
    joinQuizPublic(joinQuizDto) {
        return this.quizService.findByCode(joinQuizDto.code);
    }
    update(req, id, updateQuizDto) {
        return this.quizService.update(id, req.user.id, updateQuizDto);
    }
    remove(req, id) {
        return this.quizService.remove(id, req.user.id);
    }
    getStats(req, id) {
        return this.quizService.getQuizStatsWithGuests(id, req.user.id);
    }
    submitGuestQuiz(submitGuestQuizDto) {
        return this.quizService.submitGuestQuiz(submitGuestQuizDto);
    }
    joinLobby(joinLobbyDto) {
        return this.quizService.joinLobby(joinLobbyDto.participantName, joinLobbyDto.quizCode);
    }
    getLobbyParticipants(id) {
        return this.quizService.getLobbyParticipants(id);
    }
    removeLobbyParticipant(lobbyId) {
        return this.quizService.removeLobbyParticipant(lobbyId);
    }
    startQuiz(req, id) {
        return this.quizService.startQuiz(id, req.user.id);
    }
    getQuizStatus(id) {
        return this.quizService.getQuizStatus(id);
    }
    clearLobby(req, id) {
        return this.quizService.clearLobby(id);
    }
};
exports.QuizController = QuizController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_quiz_dto_1.CreateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('myQuizzes')),
    __param(2, (0, common_1.Query)('public')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/questions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_quiz_dto_1.JoinQuizDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "joinQuiz", null);
__decorate([
    (0, common_1.Post)('join-public'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_quiz_dto_1.JoinQuizDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "joinQuizPublic", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_quiz_dto_1.UpdateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('guest/submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_guest_quiz_dto_1.SubmitGuestQuizDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "submitGuestQuiz", null);
__decorate([
    (0, common_1.Post)('lobby/join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_lobby_dto_1.JoinLobbyDto]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "joinLobby", null);
__decorate([
    (0, common_1.Get)(':id/lobby/participants'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "getLobbyParticipants", null);
__decorate([
    (0, common_1.Delete)('lobby/:lobbyId'),
    __param(0, (0, common_1.Param)('lobbyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "removeLobbyParticipant", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "startQuiz", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "getQuizStatus", null);
__decorate([
    (0, common_1.Delete)(':id/lobby/clear'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "clearLobby", null);
exports.QuizController = QuizController = __decorate([
    (0, common_1.Controller)('quiz'),
    __metadata("design:paramtypes", [quiz_service_1.QuizService])
], QuizController);
//# sourceMappingURL=quiz.controller.js.map