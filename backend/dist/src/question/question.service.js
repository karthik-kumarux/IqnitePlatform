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
exports.QuestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionService = class QuestionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizerId, createQuestionDto) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: createQuestionDto.quizId },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to add questions to this quiz');
        }
        const question = await this.prisma.question.create({
            data: {
                ...createQuestionDto,
                options: createQuestionDto.options || undefined,
            },
        });
        return question;
    }
    async findByQuiz(quizId) {
        const questions = await this.prisma.question.findMany({
            where: { quizId },
            orderBy: {
                order: 'asc',
            },
        });
        return questions;
    }
    async findOne(id) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        organizerId: true,
                    },
                },
            },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        return question;
    }
    async update(id, organizerId, updateQuestionDto) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                quiz: true,
            },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (question.quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to update this question');
        }
        const updatedQuestion = await this.prisma.question.update({
            where: { id },
            data: {
                ...updateQuestionDto,
                options: updateQuestionDto.options !== undefined ? updateQuestionDto.options : undefined,
            },
        });
        return updatedQuestion;
    }
    async remove(id, organizerId) {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: {
                quiz: true,
            },
        });
        if (!question) {
            throw new common_1.NotFoundException('Question not found');
        }
        if (question.quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to delete this question');
        }
        await this.prisma.question.delete({ where: { id } });
        return { message: 'Question deleted successfully' };
    }
    async bulkCreate(organizerId, quizId, questions) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You are not authorized to add questions to this quiz');
        }
        const createdQuestions = await this.prisma.$transaction(questions.map((q, index) => this.prisma.question.create({
            data: {
                ...q,
                quizId,
                order: q.order !== undefined ? q.order : index,
                options: q.options || undefined,
            },
        })));
        return createdQuestions;
    }
};
exports.QuestionService = QuestionService;
exports.QuestionService = QuestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionService);
//# sourceMappingURL=question.service.js.map