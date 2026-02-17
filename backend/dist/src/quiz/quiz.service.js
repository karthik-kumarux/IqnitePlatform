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
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuizService = class QuizService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateQuizCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async create(organizerId, createQuizDto) {
        let code = this.generateQuizCode();
        let existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
        while (existingQuiz) {
            code = this.generateQuizCode();
            existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
        }
        const quiz = await this.prisma.quiz.create({
            data: {
                ...createQuizDto,
                code,
                organizerId,
                scheduledAt: createQuizDto.scheduledAt ? new Date(createQuizDto.scheduledAt) : null,
                expiresAt: createQuizDto.expiresAt ? new Date(createQuizDto.expiresAt) : null,
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        sessions: true,
                    },
                },
            },
        });
        return quiz;
    }
    async findAll(organizerId, isPublic) {
        const where = {};
        if (organizerId) {
            where.organizerId = organizerId;
        }
        if (isPublic !== undefined) {
            where.isPublic = isPublic;
        }
        const quizzes = await this.prisma.quiz.findMany({
            where,
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        sessions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return quizzes;
    }
    async findOne(id) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                questions: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                _count: {
                    select: {
                        sessions: true,
                        guestSessions: true,
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.isActive && quiz.status === 'DRAFT') {
        }
        return quiz;
    }
    async findByCode(code) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { code },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        sessions: true,
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.isActive) {
            throw new common_1.BadRequestException('This quiz is no longer active');
        }
        if (quiz.expiresAt && new Date() > quiz.expiresAt) {
            throw new common_1.BadRequestException('This quiz has expired');
        }
        return quiz;
    }
    async update(id, organizerId, updateQuizDto) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to update this quiz');
        }
        const updatedQuiz = await this.prisma.quiz.update({
            where: { id },
            data: {
                ...updateQuizDto,
                scheduledAt: updateQuizDto.scheduledAt ? new Date(updateQuizDto.scheduledAt) : undefined,
                expiresAt: updateQuizDto.expiresAt ? new Date(updateQuizDto.expiresAt) : undefined,
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        sessions: true,
                    },
                },
            },
        });
        return updatedQuiz;
    }
    async remove(id, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to delete this quiz');
        }
        await this.prisma.quiz.delete({ where: { id } });
        return { message: 'Quiz deleted successfully' };
    }
    async getQuizStats(id, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to view these stats');
        }
        const sessions = await this.prisma.quizSession.findMany({
            where: { quizId: id },
            include: {
                participant: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                score: 'desc',
            },
        });
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
        const averageScore = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
            : 0;
        const averagePercentage = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / sessions.length
            : 0;
        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                code: quiz.code,
            },
            stats: {
                totalParticipants: totalSessions,
                completed: completedSessions,
                inProgress: totalSessions - completedSessions,
                averageScore: Math.round(averageScore * 100) / 100,
                averagePercentage: Math.round(averagePercentage * 100) / 100,
            },
            leaderboard: sessions.slice(0, 10).map((session, index) => ({
                rank: index + 1,
                participant: session.participant,
                score: session.score,
                totalPoints: session.totalPoints,
                percentage: session.percentage,
                timeSpent: session.timeSpent,
                completedAt: session.completedAt,
            })),
        };
    }
    async getQuizQuestions(quizId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: {
                        order: 'asc',
                    },
                    select: {
                        id: true,
                        quizId: true,
                        type: true,
                        question: true,
                        options: true,
                        correctAnswer: true,
                        points: true,
                        timeLimit: true,
                        order: true,
                        explanation: true,
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        return quiz.questions;
    }
    async joinLobby(participantName, quizCode) {
        console.log('Join lobby request:', { participantName, quizCode });
        const quiz = await this.prisma.quiz.findUnique({
            where: { code: quizCode },
            select: { id: true, title: true, status: true }
        });
        console.log('Quiz found:', quiz);
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const currentStatus = quiz.status || 'DRAFT';
        if (currentStatus === 'COMPLETED') {
            throw new common_1.BadRequestException('Quiz has already been completed');
        }
        if (currentStatus === 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Quiz has already started');
        }
        if (currentStatus === 'DRAFT' || !quiz.status) {
            await this.prisma.quiz.update({
                where: { id: quiz.id },
                data: { status: 'WAITING' },
            });
        }
        const lobbyParticipant = await this.prisma.lobbyParticipant.create({
            data: {
                quizId: quiz.id,
                participantName,
            },
        });
        return {
            lobbyId: lobbyParticipant.id,
            quizId: quiz.id,
            quizTitle: quiz.title,
            message: 'Successfully joined the lobby. Waiting for organizer to start the quiz.',
        };
    }
    async getLobbyParticipants(quizId) {
        const participants = await this.prisma.lobbyParticipant.findMany({
            where: { quizId },
            orderBy: { joinedAt: 'asc' },
        });
        return participants;
    }
    async removeLobbyParticipant(lobbyId) {
        await this.prisma.lobbyParticipant.delete({
            where: { id: lobbyId },
        });
        return { message: 'Left the lobby successfully' };
    }
    async startQuiz(quizId, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, organizerId: true, status: true }
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('Only the quiz organizer can start the quiz');
        }
        if (quiz.status === 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Quiz has already started');
        }
        if (quiz.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Quiz has already been completed');
        }
        await this.prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'IN_PROGRESS' },
        });
        return { message: 'Quiz started successfully', status: 'IN_PROGRESS' };
    }
    async getQuizStatus(quizId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                id: true,
                title: true,
                status: true,
                code: true,
                isActive: true,
                expiresAt: true
            }
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        return {
            id: quiz.id,
            title: quiz.title,
            status: quiz.status || 'DRAFT',
            code: quiz.code,
        };
    }
    async clearLobby(quizId) {
        await this.prisma.lobbyParticipant.deleteMany({
            where: { quizId },
        });
        return { message: 'Lobby cleared successfully' };
    }
    async submitGuestQuiz(submitDto) {
        const { quizId, guestName, sessionId, score, totalPoints, timeSpent, answers } = submitDto;
        const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const existingSession = await this.prisma.guestQuizSession.findUnique({
            where: { sessionId },
        });
        if (existingSession) {
            const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
            const updatedSession = await this.prisma.guestQuizSession.update({
                where: { sessionId },
                data: {
                    score,
                    totalPoints,
                    percentage,
                    timeSpent,
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
            await this.prisma.guestAnswer.deleteMany({
                where: { sessionId: updatedSession.id },
            });
            for (const answer of answers) {
                await this.prisma.guestAnswer.create({
                    data: {
                        sessionId: updatedSession.id,
                        questionId: answer.questionId,
                        answer: answer.answer,
                        isCorrect: answer.pointsEarned > 0,
                        pointsEarned: answer.pointsEarned,
                    },
                });
            }
            return { message: 'Quiz submitted successfully', session: updatedSession };
        }
        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const session = await this.prisma.guestQuizSession.create({
            data: {
                quizId,
                guestName,
                sessionId,
                score,
                totalPoints,
                percentage,
                timeSpent,
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
        for (const answer of answers) {
            await this.prisma.guestAnswer.create({
                data: {
                    sessionId: session.id,
                    questionId: answer.questionId,
                    answer: answer.answer,
                    isCorrect: answer.pointsEarned > 0,
                    pointsEarned: answer.pointsEarned,
                },
            });
        }
        return { message: 'Quiz submitted successfully', session };
    }
    async getQuizStatsWithGuests(id, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to view these stats');
        }
        const userSessions = await this.prisma.quizSession.findMany({
            where: { quizId: id },
            include: {
                participant: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                score: 'desc',
            },
        });
        const guestSessions = await this.prisma.guestQuizSession.findMany({
            where: { quizId: id },
            orderBy: {
                score: 'desc',
            },
        });
        const allSessions = [
            ...userSessions.map(s => ({
                id: s.id,
                participant: {
                    id: s.participant.id,
                    username: s.participant.username,
                    email: s.participant.username,
                    isGuest: false,
                },
                score: s.score,
                totalPoints: s.totalPoints,
                percentage: s.percentage,
                status: s.status,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                timeSpent: s.timeSpent,
            })),
            ...guestSessions.map(s => ({
                id: s.id,
                participant: {
                    id: s.id,
                    username: s.guestName,
                    email: s.guestName,
                    isGuest: true,
                },
                score: s.score,
                totalPoints: s.totalPoints,
                percentage: s.percentage,
                status: s.status,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                timeSpent: s.timeSpent,
            })),
        ].sort((a, b) => b.score - a.score);
        const totalSessions = allSessions.length;
        const completedSessions = allSessions.filter(s => s.status === 'COMPLETED').length;
        const averageScore = allSessions.length > 0
            ? allSessions.reduce((sum, s) => sum + s.score, 0) / allSessions.length
            : 0;
        const averagePercentage = allSessions.length > 0
            ? allSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / allSessions.length
            : 0;
        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                code: quiz.code,
            },
            stats: {
                totalParticipants: totalSessions,
                completed: completedSessions,
                inProgress: totalSessions - completedSessions,
                averageScore: Math.round(averageScore * 100) / 100,
                averagePercentage: Math.round(averagePercentage * 100) / 100,
            },
            leaderboard: allSessions.slice(0, 50).map((session, index) => ({
                rank: index + 1,
                participant: session.participant,
                score: session.score,
                totalPoints: session.totalPoints,
                percentage: session.percentage,
                timeSpent: session.timeSpent,
                completedAt: session.completedAt,
                status: session.status,
            })),
        };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map