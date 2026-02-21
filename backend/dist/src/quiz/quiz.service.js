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
const bulk_operation_dto_1 = require("./dto/bulk-operation.dto");
const quiz_gateway_1 = require("./quiz.gateway");
let QuizService = class QuizService {
    prisma;
    quizGateway;
    constructor(prisma, quizGateway) {
        this.prisma = prisma;
        this.quizGateway = quizGateway;
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
    async findAll(organizerId, isPublic, includeArchived = false, page = 1, limit = 10) {
        const where = {};
        if (organizerId) {
            where.organizerId = organizerId;
        }
        if (isPublic !== undefined) {
            where.isPublic = isPublic;
        }
        if (!includeArchived) {
            where.isArchived = false;
        }
        const skip = (page - 1) * limit;
        const [quizzes, total] = await Promise.all([
            this.prisma.quiz.findMany({
                where,
                skip,
                take: limit,
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
            }),
            this.prisma.quiz.count({ where }),
        ]);
        return {
            data: quizzes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
        const updateData = {
            ...updateQuizDto,
            scheduledAt: updateQuizDto.scheduledAt ? new Date(updateQuizDto.scheduledAt) : undefined,
            expiresAt: updateQuizDto.expiresAt ? new Date(updateQuizDto.expiresAt) : undefined,
        };
        if (quiz.status === 'COMPLETED' && !updateQuizDto.status) {
            updateData.status = 'DRAFT';
        }
        const updatedQuiz = await this.prisma.quiz.update({
            where: { id },
            data: updateData,
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
            select: {
                id: true,
                code: true,
                title: true,
                description: true,
                organizerId: true,
                isPublic: true,
                duration: true,
                passingScore: true,
                maxAttempts: true,
                showAnswers: true,
                shuffleQuestions: true,
                randomizeOptions: true,
                enableAdaptiveDifficulty: true,
                questionPoolSize: true,
                questionPoolTags: true,
                scheduledAt: true,
                expiresAt: true,
                isActive: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                questions: {
                    where: { isActive: true },
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
                        imageUrl: true,
                        videoUrl: true,
                        difficulty: true,
                        tags: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        let questions = [...quiz.questions];
        if (quiz.questionPoolTags && quiz.questionPoolTags.length > 0) {
            questions = questions.filter(q => q.tags.some(tag => quiz.questionPoolTags.includes(tag)));
        }
        if (quiz.shuffleQuestions) {
            questions = this.shuffleArray(questions);
        }
        if (quiz.questionPoolSize && quiz.questionPoolSize < questions.length) {
            questions = questions.slice(0, quiz.questionPoolSize);
        }
        if (quiz.randomizeOptions) {
            questions = questions.map(q => {
                if (q.type === 'MULTIPLE_CHOICE' && q.options) {
                    return this.randomizeQuestionOptions(q);
                }
                return q;
            });
        }
        return questions;
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    randomizeQuestionOptions(question) {
        const options = [...question.options];
        const correctAnswer = question.correctAnswer;
        const shuffled = this.shuffleArray(options);
        return {
            ...question,
            options: shuffled,
            correctAnswer,
        };
    }
    async joinLobby(participantName, quizCode) {
        console.log('Join lobby request:', { participantName, quizCode });
        const quiz = await this.prisma.quiz.findUnique({
            where: { code: quizCode },
            select: { id: true, title: true, status: true, expiresAt: true }
        });
        console.log('Quiz found:', quiz);
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.expiresAt && new Date() > quiz.expiresAt) {
            throw new common_1.BadRequestException('Quiz has expired and is no longer available');
        }
        const currentStatus = quiz.status || 'DRAFT';
        if (currentStatus === 'DRAFT' || currentStatus === 'COMPLETED' || !quiz.status) {
            await this.prisma.quiz.update({
                where: { id: quiz.id },
                data: { status: 'WAITING' },
            });
            this.quizGateway.emitQuizStatusChange(quiz.id, 'WAITING');
        }
        const lobbyParticipant = await this.prisma.lobbyParticipant.create({
            data: {
                quizId: quiz.id,
                participantName,
            },
        });
        this.quizGateway.emitParticipantJoined(quiz.id, {
            id: lobbyParticipant.id,
            participantName: lobbyParticipant.participantName,
            joinedAt: lobbyParticipant.joinedAt,
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
        const participant = await this.prisma.lobbyParticipant.findUnique({
            where: { id: lobbyId },
            select: { quizId: true },
        });
        if (participant) {
            await this.prisma.lobbyParticipant.delete({
                where: { id: lobbyId },
            });
            this.quizGateway.emitParticipantLeft(participant.quizId, lobbyId);
            this.quizGateway.emitParticipantRemoved(participant.quizId, lobbyId);
        }
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
            throw new common_1.BadRequestException('Quiz is already in progress');
        }
        await this.prisma.quiz.updateMany({
            where: {
                organizerId,
                status: 'IN_PROGRESS',
                id: { not: quizId }
            },
            data: { status: 'COMPLETED' },
        });
        await this.prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'IN_PROGRESS' },
        });
        this.quizGateway.emitQuizStarted(quizId, {
            quizId,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
        });
        this.quizGateway.emitQuizStatusChange(quizId, 'IN_PROGRESS');
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
    async resetQuiz(quizId, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, organizerId: true, status: true }
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('Only the quiz organizer can reset the quiz');
        }
        await this.prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'COMPLETED' },
        });
        await this.prisma.lobbyParticipant.deleteMany({
            where: { quizId },
        });
        return {
            message: 'Quiz session completed and moved to history. You can start a new quiz now.',
            status: 'COMPLETED'
        };
    }
    async getActiveQuiz(organizerId) {
        const activeQuiz = await this.prisma.quiz.findFirst({
            where: {
                organizerId,
                status: 'IN_PROGRESS',
                isArchived: false
            },
            include: {
                _count: {
                    select: {
                        questions: true,
                        sessions: true,
                        guestSessions: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return activeQuiz;
    }
    async getRecentQuizzes(organizerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [quizzes, total] = await Promise.all([
            this.prisma.quiz.findMany({
                where: {
                    organizerId,
                    status: 'COMPLETED',
                    isArchived: false
                },
                include: {
                    _count: {
                        select: {
                            questions: true,
                            sessions: true,
                            guestSessions: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.quiz.count({
                where: {
                    organizerId,
                    status: 'COMPLETED',
                    isArchived: false
                }
            }),
        ]);
        return {
            data: quizzes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getQuizResults(quizId, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    select: {
                        id: true,
                        question: true,
                        type: true,
                        correctAnswer: true,
                        points: true,
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
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You can only view results for your own quizzes');
        }
        const [sessions, guestSessions] = await Promise.all([
            this.prisma.quizSession.findMany({
                where: { quizId },
                include: {
                    participant: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    answers: {
                        include: {
                            question: {
                                select: {
                                    id: true,
                                    question: true,
                                    correctAnswer: true,
                                    points: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { score: 'desc' },
            }),
            this.prisma.guestQuizSession.findMany({
                where: { quizId },
                include: {
                    answers: {
                        include: {
                            question: {
                                select: {
                                    id: true,
                                    question: true,
                                    correctAnswer: true,
                                    points: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { score: 'desc' },
            }),
        ]);
        const allSessions = [...sessions, ...guestSessions];
        const completedSessions = allSessions.filter(s => s.status === 'COMPLETED');
        const totalParticipants = allSessions.length;
        const completedCount = completedSessions.length;
        const averageScore = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length
            : 0;
        const averagePercentage = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSessions.length
            : 0;
        const participants = [
            ...sessions.map(s => ({
                id: s.participant.id,
                name: s.participant.firstName && s.participant.lastName
                    ? `${s.participant.firstName} ${s.participant.lastName}`
                    : s.participant.username,
                email: s.participant.email,
                type: 'authenticated',
                score: s.score,
                totalPoints: s.totalPoints,
                percentage: s.percentage,
                status: s.status,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                timeSpent: s.timeSpent,
                answers: s.answers,
            })),
            ...guestSessions.map(s => ({
                id: s.id,
                name: s.guestName,
                email: 'Guest User',
                type: 'guest',
                score: s.score,
                totalPoints: s.totalPoints,
                percentage: s.percentage,
                status: s.status,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                timeSpent: s.timeSpent,
                answers: s.answers,
            })),
        ];
        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                code: quiz.code,
                status: quiz.status,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt,
            },
            statistics: {
                totalParticipants,
                completedCount,
                inProgressCount: totalParticipants - completedCount,
                totalQuestions: quiz.questions.length,
                averageScore: Math.round(averageScore * 100) / 100,
                averagePercentage: Math.round(averagePercentage * 100) / 100,
            },
            participants: participants.sort((a, b) => b.score - a.score),
        };
    }
    async bulkOperation(organizerId, bulkOperationDto) {
        const { quizIds, operation } = bulkOperationDto;
        const quizzes = await this.prisma.quiz.findMany({
            where: {
                id: { in: quizIds },
                organizerId,
            },
            select: { id: true },
        });
        if (quizzes.length !== quizIds.length) {
            throw new common_1.ForbiddenException('Some quizzes do not belong to you or do not exist');
        }
        let result;
        switch (operation) {
            case bulk_operation_dto_1.BulkOperationType.DELETE:
                result = await this.prisma.quiz.deleteMany({
                    where: { id: { in: quizIds } },
                });
                break;
            case bulk_operation_dto_1.BulkOperationType.ARCHIVE:
                result = await this.prisma.quiz.updateMany({
                    where: { id: { in: quizIds } },
                    data: { isArchived: true, archivedAt: new Date() },
                });
                break;
            case bulk_operation_dto_1.BulkOperationType.UNARCHIVE:
                result = await this.prisma.quiz.updateMany({
                    where: { id: { in: quizIds } },
                    data: { isArchived: false, archivedAt: null },
                });
                break;
            case bulk_operation_dto_1.BulkOperationType.ACTIVATE:
                result = await this.prisma.quiz.updateMany({
                    where: { id: { in: quizIds } },
                    data: { isActive: true },
                });
                break;
            case bulk_operation_dto_1.BulkOperationType.DEACTIVATE:
                result = await this.prisma.quiz.updateMany({
                    where: { id: { in: quizIds } },
                    data: { isActive: false },
                });
                break;
            default:
                throw new common_1.BadRequestException('Invalid operation');
        }
        return {
            message: `Successfully performed ${operation} on ${result.count} quiz(es)`,
            count: result.count,
        };
    }
    async exportQuizzes(organizerId, exportDto) {
        const where = {
            organizerId,
        };
        if (exportDto.quizIds && exportDto.quizIds.length > 0) {
            where.id = { in: exportDto.quizIds };
        }
        const quizzes = await this.prisma.quiz.findMany({
            where,
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        const backup = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            organizerId,
            quizCount: quizzes.length,
            quizzes: quizzes.map(quiz => ({
                ...quiz,
                id: undefined,
                organizerId: undefined,
                code: undefined,
                questions: quiz.questions.map(q => ({
                    ...q,
                    id: undefined,
                    quizId: undefined,
                })),
            })),
        };
        return {
            filename: `iqnite-backup-${Date.now()}.json`,
            data: backup,
        };
    }
    async importQuizzes(organizerId, backupData) {
        try {
            const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            if (!backup.quizzes || !Array.isArray(backup.quizzes)) {
                throw new common_1.BadRequestException('Invalid backup format');
            }
            const importedQuizzes = [];
            for (const quizData of backup.quizzes) {
                let code = this.generateQuizCode();
                let existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
                while (existingQuiz) {
                    code = this.generateQuizCode();
                    existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
                }
                const { questions, ...quizFields } = quizData;
                const quiz = await this.prisma.quiz.create({
                    data: {
                        ...quizFields,
                        code,
                        organizerId,
                        isArchived: false,
                        archivedAt: null,
                        status: 'DRAFT',
                        scheduledAt: quizFields.scheduledAt ? new Date(quizFields.scheduledAt) : null,
                        expiresAt: quizFields.expiresAt ? new Date(quizFields.expiresAt) : null,
                        questions: {
                            create: questions.map((q, index) => ({
                                ...q,
                                order: index,
                            })),
                        },
                    },
                    include: {
                        questions: true,
                    },
                });
                importedQuizzes.push(quiz);
            }
            return {
                message: `Successfully imported ${importedQuizzes.length} quiz(es)`,
                count: importedQuizzes.length,
                quizzes: importedQuizzes.map(q => ({
                    id: q.id,
                    title: q.title,
                    code: q.code,
                    questionCount: q.questions.length,
                })),
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to import quizzes: ${error.message}`);
        }
    }
    async archiveQuiz(quizId, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, organizerId: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You can only archive your own quizzes');
        }
        await this.prisma.quiz.update({
            where: { id: quizId },
            data: { isArchived: true, archivedAt: new Date() },
        });
        return { message: 'Quiz archived successfully' };
    }
    async unarchiveQuiz(quizId, organizerId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, organizerId: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You can only unarchive your own quizzes');
        }
        await this.prisma.quiz.update({
            where: { id: quizId },
            data: { isArchived: false, archivedAt: null },
        });
        return { message: 'Quiz unarchived successfully' };
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quiz_gateway_1.QuizGateway])
], QuizService);
//# sourceMappingURL=quiz.service.js.map