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

    // Create question with base64 image stored directly in PostgreSQL
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

  // Get randomized questions for quiz with optional filtering
  async getQuestionsForQuiz(quizId: string, options?: {
    shuffle?: boolean;
    limit?: number;
    tags?: string[];
    difficulty?: string;
  }) {
    const whereClause: any = {
      quizId,
      isActive: true,
    };

    // Filter by tags if specified
    if (options?.tags && options.tags.length > 0) {
      whereClause.tags = {
        hasSome: options.tags,
      };
    }

    // Filter by difficulty if specified
    if (options?.difficulty) {
      whereClause.difficulty = options.difficulty;
    }

    let questions = await this.prisma.question.findMany({
      where: whereClause,
      orderBy: options?.shuffle ? undefined : { order: 'asc' },
    });

    // Shuffle questions if requested
    if (options?.shuffle) {
      questions = this.shuffleArray(questions);
    }

    // Limit number of questions if specified
    if (options?.limit && options.limit < questions.length) {
      questions = questions.slice(0, options.limit);
    }

    return questions;
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Randomize MCQ options
  shuffleOptions(question: any): any {
    if (question.type !== 'MULTIPLE_CHOICE' || !question.options) {
      return question;
    }

    const options = [...question.options];
    const correctIndex = options.indexOf(question.correctAnswer);
    
    // Shuffle options
    const shuffled = this.shuffleArray(options);
    
    // Update correct answer to new position
    const newCorrectAnswer = shuffled[shuffled.indexOf(question.correctAnswer)];

    return {
      ...question,
      options: shuffled,
      correctAnswer: newCorrectAnswer,
    };
  }
}
