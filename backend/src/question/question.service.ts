import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, createQuestionDto: CreateQuestionDto) {
    // Verify quiz belongs to organizer
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: createQuestionDto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to add questions to this quiz');
    }

    const question = await this.prisma.question.create({
      data: {
        ...createQuestionDto,
        options: createQuestionDto.options || undefined,
      },
    });

    return question;
  }

  async findByQuiz(quizId: string) {
    const questions = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: {
        order: 'asc',
      },
    });

    return questions;
  }

  async findOne(id: string) {
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
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async update(id: string, organizerId: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to update this question');
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

  async remove(id: string, organizerId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to delete this question');
    }

    await this.prisma.question.delete({ where: { id } });

    return { message: 'Question deleted successfully' };
  }

  async bulkCreate(organizerId: string, quizId: string, questions: CreateQuestionDto[]) {
    // Verify quiz belongs to organizer
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to add questions to this quiz');
    }

    const createdQuestions = await this.prisma.$transaction(
      questions.map((q, index) =>
        this.prisma.question.create({
          data: {
            ...q,
            quizId,
            order: q.order !== undefined ? q.order : index,
            options: q.options || undefined,
          },
        }),
      ),
    );

    return createdQuestions;
  }
}
