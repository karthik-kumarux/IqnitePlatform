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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionService = class SessionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startQuiz(participantId, quizId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.isActive) {
            throw new common_1.BadRequestException('This quiz is not active');
        }
        if (quiz.expiresAt && new Date() > quiz.expiresAt) {
            throw new common_1.BadRequestException('This quiz has expired');
        }
        if (quiz.scheduledAt && new Date() < quiz.scheduledAt) {
            throw new common_1.BadRequestException('This quiz has not started yet');
        }
        if (quiz.questions.length === 0) {
            throw new common_1.BadRequestException('This quiz has no questions');
        }
        const existingSessions = await this.prisma.quizSession.findMany({
            where: {
                quizId,
                participantId,
            },
        });
        const completedSessions = existingSessions.filter(s => s.status === 'COMPLETED');
        if (completedSessions.length >= quiz.maxAttempts) {
            throw new common_1.BadRequestException(`You have reached the maximum number of attempts (${quiz.maxAttempts})`);
        }
        const activeSession = existingSessions.find(s => s.status === 'IN_PROGRESS');
        if (activeSession) {
            return this.getSession(activeSession.id, participantId);
        }
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const session = await this.prisma.quizSession.create({
            data: {
                quizId,
                participantId,
                totalPoints,
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            select: {
                                id: true,
                                type: true,
                                question: true,
                                options: true,
                                points: true,
                                timeLimit: true,
                                order: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
            },
        });
        if (quiz.shuffleQuestions) {
            session.quiz.questions = this.shuffleArray(session.quiz.questions);
        }
        return {
            session: {
                id: session.id,
                status: session.status,
                startedAt: session.startedAt,
            },
            quiz: {
                id: session.quiz.id,
                title: session.quiz.title,
                description: session.quiz.description,
                duration: session.quiz.duration,
                totalPoints: session.totalPoints,
                questionCount: session.quiz.questions.length,
            },
            questions: session.quiz.questions,
        };
    }
    async submitAnswer(sessionId, participantId, submitAnswerDto) {
        const session = await this.prisma.quizSession.findUnique({
            where: { id: sessionId },
            include: {
                quiz: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Quiz session not found');
        }
        if (session.participantId !== participantId) {
            throw new common_1.ForbiddenException('You are not authorized to submit answers for this session');
        }
        if (session.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('This quiz session is not active');
        }
        const question = await this.prisma.question.findUnique({
            where: { id: submitAnswerDto.questionId },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (question.quizId !== session.quizId) {
            throw new common_1.BadRequestException('Question does not belong to this quiz');
        }
        const existingAnswer = await this.prisma.answer.findUnique({
            where: {
                sessionId_questionId: {
                    sessionId,
                    questionId: submitAnswerDto.questionId,
                },
            },
        });
        if (existingAnswer) {
            throw new common_1.BadRequestException('You have already answered this question');
        }
        const isCorrect = this.checkAnswer(submitAnswerDto.answer, question.correctAnswer, question.type);
        const pointsEarned = isCorrect ? question.points : 0;
        const answer = await this.prisma.answer.create({
            data: {
                sessionId,
                questionId: submitAnswerDto.questionId,
                participantId,
                answer: submitAnswerDto.answer,
                isCorrect,
                pointsEarned,
                timeSpent: submitAnswerDto.timeSpent,
            },
        });
        await this.prisma.quizSession.update({
            where: { id: sessionId },
            data: {
                score: {
                    increment: pointsEarned,
                },
            },
        });
        return {
            answerId: answer.id,
            isCorrect,
            pointsEarned,
            ...(session.quiz.showAnswers && {
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
            }),
        };
    }
    async completeQuiz(sessionId, participantId) {
        const session = await this.prisma.quizSession.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        questions: true,
                    },
                },
                answers: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Quiz session not found');
        }
        if (session.participantId !== participantId) {
            throw new common_1.ForbiddenException('You are not authorized to complete this session');
        }
        if (session.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('This quiz session is already completed');
        }
        const timeSpent = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
        const percentage = session.totalPoints > 0 ? (session.score / session.totalPoints) * 100 : 0;
        let status = 'COMPLETED';
        if (session.quiz.duration && timeSpent > session.quiz.duration * 60) {
            status = 'TIMED_OUT';
        }
        const updatedSession = await this.prisma.quizSession.update({
            where: { id: sessionId },
            data: {
                status,
                completedAt: new Date(),
                timeSpent,
                percentage,
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        passingScore: true,
                        showAnswers: true,
                    },
                },
                answers: {
                    include: {
                        question: true,
                    },
                },
            },
        });
        const passed = percentage >= (session.quiz.passingScore || 0);
        return {
            sessionId: updatedSession.id,
            score: updatedSession.score,
            totalPoints: updatedSession.totalPoints,
            percentage: Math.round(percentage * 100) / 100,
            passed,
            timeSpent,
            answeredQuestions: updatedSession.answers.length,
            totalQuestions: session.quiz.questions.length,
            ...(updatedSession.quiz.showAnswers && {
                answers: updatedSession.answers.map(a => ({
                    questionId: a.questionId,
                    question: a.question.question,
                    yourAnswer: a.answer,
                    correctAnswer: a.question.correctAnswer,
                    isCorrect: a.isCorrect,
                    pointsEarned: a.pointsEarned,
                    explanation: a.question.explanation,
                })),
            }),
        };
    }
    async getSession(sessionId, participantId) {
        const session = await this.prisma.quizSession.findUnique({
            where: { id: sessionId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            select: {
                                id: true,
                                type: true,
                                question: true,
                                options: true,
                                points: true,
                                timeLimit: true,
                                order: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
                answers: {
                    select: {
                        questionId: true,
                        answer: true,
                        isCorrect: true,
                        pointsEarned: true,
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Quiz session not found');
        }
        if (session.participantId !== participantId) {
            throw new common_1.ForbiddenException('You are not authorized to view this session');
        }
        return {
            session: {
                id: session.id,
                status: session.status,
                score: session.score,
                totalPoints: session.totalPoints,
                startedAt: session.startedAt,
                completedAt: session.completedAt,
            },
            quiz: {
                id: session.quiz.id,
                title: session.quiz.title,
                description: session.quiz.description,
                duration: session.quiz.duration,
                questionCount: session.quiz.questions.length,
            },
            questions: session.quiz.questions,
            answeredQuestions: session.answers,
        };
    }
    async getMyResults(participantId) {
        const sessions = await this.prisma.quizSession.findMany({
            where: {
                participantId,
                status: 'COMPLETED',
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        passingScore: true,
                    },
                },
            },
            orderBy: {
                completedAt: 'desc',
            },
        });
        return sessions.map(session => ({
            sessionId: session.id,
            quiz: session.quiz,
            score: session.score,
            totalPoints: session.totalPoints,
            percentage: session.percentage,
            passed: (session.percentage || 0) >= (session.quiz.passingScore || 0),
            completedAt: session.completedAt,
            timeSpent: session.timeSpent,
        }));
    }
    checkAnswer(userAnswer, correctAnswer, type) {
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
        if (type === 'SHORT_ANSWER') {
            return normalizedUserAnswer === normalizedCorrectAnswer;
        }
        return normalizedUserAnswer === normalizedCorrectAnswer;
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map