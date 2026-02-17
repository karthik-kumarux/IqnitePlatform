import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async startQuiz(participantId: string, quizId: string) {
    // Check if quiz exists and is active
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isActive) {
      throw new BadRequestException('This quiz is not active');
    }

    if (quiz.expiresAt && new Date() > quiz.expiresAt) {
      throw new BadRequestException('This quiz has expired');
    }

    if (quiz.scheduledAt && new Date() < quiz.scheduledAt) {
      throw new BadRequestException('This quiz has not started yet');
    }

    // Check if quiz has questions
    if (quiz.questions.length === 0) {
      throw new BadRequestException('This quiz has no questions');
    }

    // Check existing sessions
    const existingSessions = await this.prisma.quizSession.findMany({
      where: {
        quizId,
        participantId,
      },
    });

    const completedSessions = existingSessions.filter(s => s.status === 'COMPLETED');

    if (completedSessions.length >= quiz.maxAttempts) {
      throw new BadRequestException(`You have reached the maximum number of attempts (${quiz.maxAttempts})`);
    }

    // Check if there's an active session
    const activeSession = existingSessions.find(s => s.status === 'IN_PROGRESS');
    if (activeSession) {
      return this.getSession(activeSession.id, participantId);
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    // Create new session
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
                // Don't include correctAnswer or explanation
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    // Shuffle questions if enabled
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

  async submitAnswer(sessionId: string, participantId: string, submitAnswerDto: SubmitAnswerDto) {
    // Get session
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quiz: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Quiz session not found');
    }

    if (session.participantId !== participantId) {
      throw new ForbiddenException('You are not authorized to submit answers for this session');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('This quiz session is not active');
    }

    // Get question
    const question = await this.prisma.question.findUnique({
      where: { id: submitAnswerDto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quizId !== session.quizId) {
      throw new BadRequestException('Question does not belong to this quiz');
    }

    // Check if already answered
    const existingAnswer = await this.prisma.answer.findUnique({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId: submitAnswerDto.questionId,
        },
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('You have already answered this question');
    }

    // Check if answer is correct
    const isCorrect = this.checkAnswer(submitAnswerDto.answer, question.correctAnswer, question.type);
    const pointsEarned = isCorrect ? question.points : 0;

    // Create answer
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

    // Update session score
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

  async completeQuiz(sessionId: string, participantId: string) {
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
      throw new NotFoundException('Quiz session not found');
    }

    if (session.participantId !== participantId) {
      throw new ForbiddenException('You are not authorized to complete this session');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('This quiz session is already completed');
    }

    // Calculate time spent
    const timeSpent = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);

    // Calculate percentage
    const percentage = session.totalPoints > 0 ? (session.score / session.totalPoints) * 100 : 0;

    // Determine status
    let status: 'COMPLETED' | 'TIMED_OUT' = 'COMPLETED';
    if (session.quiz.duration && timeSpent > session.quiz.duration * 60) {
      status = 'TIMED_OUT';
    }

    // Update session
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

  async getSession(sessionId: string, participantId: string) {
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
      throw new NotFoundException('Quiz session not found');
    }

    if (session.participantId !== participantId) {
      throw new ForbiddenException('You are not authorized to view this session');
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

  async getMyResults(participantId: string) {
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

  private checkAnswer(userAnswer: string, correctAnswer: string, type: string): boolean {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

    if (type === 'SHORT_ANSWER') {
      // For short answers, check if the answer contains the correct answer
      return normalizedUserAnswer === normalizedCorrectAnswer;
    }

    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
