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
exports.QuizGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let QuizGateway = class QuizGateway {
    server;
    logger = new common_1.Logger('QuizGateway');
    quizRooms = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.quizRooms.forEach((clients, quizId) => {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                if (clients.size === 0) {
                    this.quizRooms.delete(quizId);
                }
            }
        });
    }
    handleJoinQuizRoom(data, client) {
        const { quizId } = data;
        client.join(`quiz-${quizId}`);
        if (!this.quizRooms.has(quizId)) {
            this.quizRooms.set(quizId, new Set());
        }
        this.quizRooms.get(quizId)?.add(client.id);
        this.logger.log(`Client ${client.id} joined quiz room: ${quizId}`);
        return { success: true, message: 'Joined quiz room' };
    }
    handleLeaveQuizRoom(data, client) {
        const { quizId } = data;
        client.leave(`quiz-${quizId}`);
        const roomClients = this.quizRooms.get(quizId);
        if (roomClients) {
            roomClients.delete(client.id);
            if (roomClients.size === 0) {
                this.quizRooms.delete(quizId);
            }
        }
        this.logger.log(`Client ${client.id} left quiz room: ${quizId}`);
        return { success: true, message: 'Left quiz room' };
    }
    emitLobbyUpdate(quizId, data) {
        this.server.to(`quiz-${quizId}`).emit('lobbyUpdate', data);
        this.logger.log(`Lobby update emitted to quiz ${quizId}`);
    }
    emitQuizStarted(quizId, data) {
        this.server.to(`quiz-${quizId}`).emit('quizStarted', data);
        this.logger.log(`Quiz started event emitted to quiz ${quizId}`);
    }
    emitQuizEnded(quizId, data) {
        this.server.to(`quiz-${quizId}`).emit('quizEnded', data);
        this.logger.log(`Quiz ended event emitted to quiz ${quizId}`);
    }
    emitParticipantJoined(quizId, participant) {
        this.server.to(`quiz-${quizId}`).emit('participantJoined', participant);
        this.logger.log(`Participant joined event emitted to quiz ${quizId}`);
    }
    emitParticipantLeft(quizId, participantId) {
        this.server.to(`quiz-${quizId}`).emit('participantLeft', { participantId });
        this.logger.log(`Participant left event emitted to quiz ${quizId}`);
    }
    emitParticipantRemoved(quizId, lobbyId) {
        this.server.to(`quiz-${quizId}`).emit('participantRemoved', { lobbyId });
        this.logger.log(`Participant removed event emitted to quiz ${quizId}, lobbyId: ${lobbyId}`);
    }
    emitLeaderboardUpdate(quizId, leaderboard) {
        this.server.to(`quiz-${quizId}`).emit('leaderboardUpdate', leaderboard);
        this.logger.log(`Leaderboard update emitted to quiz ${quizId}`);
    }
    emitQuizStatusChange(quizId, status) {
        this.server.to(`quiz-${quizId}`).emit('quizStatusChange', { status });
        this.logger.log(`Quiz status change emitted to quiz ${quizId}: ${status}`);
    }
};
exports.QuizGateway = QuizGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QuizGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinQuizRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QuizGateway.prototype, "handleJoinQuizRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveQuizRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], QuizGateway.prototype, "handleLeaveQuizRoom", null);
exports.QuizGateway = QuizGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        },
    })
], QuizGateway);
//# sourceMappingURL=quiz.gateway.js.map