import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitGuestQuizDto } from './dto/submit-guest-quiz.dto';
import { BulkOperationDto, BulkOperationType } from './dto/bulk-operation.dto';
import { ExportQuizzesDto } from './dto/export-quiz.dto';
import { QuizGateway } from './quiz.gateway';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private quizGateway: QuizGateway,
  ) {}

  // Generate unique 6-character quiz code
  private generateQuizCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async create(organizerId: string, createQuizDto: CreateQuizDto) {
    // Generate unique code
    let code = this.generateQuizCode();
    let existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
    
    // Retry if code exists
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

  async findAll(organizerId?: string, isPublic?: boolean, includeArchived = false, page = 1, limit = 10) {
    const where: any = {};
    
    if (organizerId) {
      where.organizerId = organizerId;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    // By default, exclude archived quizzes
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

  async findOne(id: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    // Allow access to quiz details for guests in lobby (DRAFT, WAITING, IN_PROGRESS)
    // Only block if quiz is not active or expired
    if (!quiz.isActive && quiz.status === 'DRAFT') {
      // Allow draft quizzes to be viewed (organizer might be setting up)
      // The organizer UI will handle what to show
    }

    return quiz;
  }

  async findByCode(code: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isActive) {
      throw new BadRequestException('This quiz is no longer active');
    }

    if (quiz.expiresAt && new Date() > quiz.expiresAt) {
      throw new BadRequestException('This quiz has expired');
    }

    return quiz;
  }

  async update(id: string, organizerId: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to update this quiz');
    }

    // If quiz was COMPLETED and being edited, reset to DRAFT for reuse
    const updateData: any = {
      ...updateQuizDto,
      scheduledAt: updateQuizDto.scheduledAt ? new Date(updateQuizDto.scheduledAt) : undefined,
      expiresAt: updateQuizDto.expiresAt ? new Date(updateQuizDto.expiresAt) : undefined,
    };

    // Reset COMPLETED quizzes to DRAFT when edited (allows reuse)
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

  async remove(id: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to delete this quiz');
    }

    await this.prisma.quiz.delete({ where: { id } });

    return { message: 'Quiz deleted successfully' };
  }

  async getQuizStats(id: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to view these stats');
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

  async getQuizQuestions(quizId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    let questions = [...quiz.questions];

    // Apply question pool filtering if configured
    if (quiz.questionPoolTags && quiz.questionPoolTags.length > 0) {
      questions = questions.filter(q => 
        q.tags.some(tag => quiz.questionPoolTags.includes(tag))
      );
    }

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      questions = this.shuffleArray(questions);
    }

    // Limit to pool size if specified
    if (quiz.questionPoolSize && quiz.questionPoolSize < questions.length) {
      questions = questions.slice(0, quiz.questionPoolSize);
    }

    // Randomize MCQ options if enabled
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

  // Helper method to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Helper method to randomize MCQ options
  private randomizeQuestionOptions(question: any): any {
    const options = [...(question.options as string[])];
    const correctAnswer = question.correctAnswer;
    
    // Shuffle the options array
    const shuffled = this.shuffleArray(options);
    
    return {
      ...question,
      options: shuffled,
      correctAnswer, // Keep the same correct answer value
    };
  }  // Lobby Management Methods
  async joinLobby(participantName: string, quizCode: string) {
    console.log('Join lobby request:', { participantName, quizCode });
    
    const quiz = await this.prisma.quiz.findUnique({ 
      where: { code: quizCode },
      select: { id: true, title: true, status: true, expiresAt: true }
    });

    console.log('Quiz found:', quiz);

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if quiz has expired
    if (quiz.expiresAt && new Date() > quiz.expiresAt) {
      throw new BadRequestException('Quiz has expired and is no longer available');
    }

    const currentStatus = quiz.status || 'DRAFT';

    // Allow participants to join at any time before expiry
    // Update quiz status to WAITING if it's still in DRAFT or COMPLETED
    if (currentStatus === 'DRAFT' || currentStatus === 'COMPLETED' || !quiz.status) {
      await this.prisma.quiz.update({
        where: { id: quiz.id },
        data: { status: 'WAITING' },
      });
      
      // Emit status change event
      this.quizGateway.emitQuizStatusChange(quiz.id, 'WAITING');
    }

    // Create lobby participant
    const lobbyParticipant = await this.prisma.lobbyParticipant.create({
      data: {
        quizId: quiz.id,
        participantName,
      },
    });

    // Emit real-time update to all clients in the quiz room
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

  async getLobbyParticipants(quizId: string) {
    const participants = await this.prisma.lobbyParticipant.findMany({
      where: { quizId },
      orderBy: { joinedAt: 'asc' },
    });

    return participants;
  }

  async removeLobbyParticipant(lobbyId: string) {
    const participant = await this.prisma.lobbyParticipant.findUnique({
      where: { id: lobbyId },
      select: { quizId: true },
    });

    if (participant) {
      await this.prisma.lobbyParticipant.delete({
        where: { id: lobbyId },
      });

      // Emit real-time updates
      this.quizGateway.emitParticipantLeft(participant.quizId, lobbyId);
      this.quizGateway.emitParticipantRemoved(participant.quizId, lobbyId);
    }

    return { message: 'Left the lobby successfully' };
  }

  async startQuiz(quizId: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, organizerId: true, status: true }
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('Only the quiz organizer can start the quiz');
    }

    if (quiz.status === 'IN_PROGRESS') {
      throw new BadRequestException('Quiz is already in progress');
    }

    // Auto-complete any other IN_PROGRESS quiz by this organizer (quiz history tracking)
    await this.prisma.quiz.updateMany({
      where: { 
        organizerId,
        status: 'IN_PROGRESS',
        id: { not: quizId }
      },
      data: { status: 'COMPLETED' },
    });

    // Allow starting even if COMPLETED (for reuse)
    // Update quiz status to IN_PROGRESS
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { status: 'IN_PROGRESS' },
    });

    // Emit real-time event to all participants
    this.quizGateway.emitQuizStarted(quizId, {
      quizId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    });
    
    // Also emit status change for consistency
    this.quizGateway.emitQuizStatusChange(quizId, 'IN_PROGRESS');

    return { message: 'Quiz started successfully', status: 'IN_PROGRESS' };
  }

  async getQuizStatus(quizId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    // Don't block access for guests in lobby waiting for organizer to start
    // Just return the status
    return {
      id: quiz.id,
      title: quiz.title,
      status: quiz.status || 'DRAFT',
      code: quiz.code,
    };
  }

  async clearLobby(quizId: string) {
    await this.prisma.lobbyParticipant.deleteMany({
      where: { quizId },
    });

    return { message: 'Lobby cleared successfully' };
  }

  async submitGuestQuiz(submitDto: SubmitGuestQuizDto) {
    const { quizId, guestName, sessionId, score, totalPoints, timeSpent, answers } = submitDto;

    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if session already exists
    const existingSession = await this.prisma.guestQuizSession.findUnique({
      where: { sessionId },
    });

    if (existingSession) {
      // Update existing session
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

      // Delete existing answers and create new ones
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

    // Create new session
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

    // Create answers
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

  async getQuizStatsWithGuests(id: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You are not authorized to view these stats');
    }

    // Get registered user sessions
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

    // Get guest sessions
    const guestSessions = await this.prisma.guestQuizSession.findMany({
      where: { quizId: id },
      orderBy: {
        score: 'desc',
      },
    });

    // Combine both types of sessions
    const allSessions = [
      ...userSessions.map(s => ({
        id: s.id,
        participant: {
          id: s.participant.id,
          username: s.participant.username,
          email: s.participant.username, // fallback
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

  async resetQuiz(quizId: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, organizerId: true, status: true }
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('Only the quiz organizer can reset the quiz');
    }

    // Mark current quiz as COMPLETED (moves to history) and clear lobby
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { status: 'COMPLETED' },
    });

    // Clear lobby participants
    await this.prisma.lobbyParticipant.deleteMany({
      where: { quizId },
    });

    return { 
      message: 'Quiz session completed and moved to history. You can start a new quiz now.',
      status: 'COMPLETED'
    };
  }

  // Get organizer's active quiz (IN_PROGRESS status)
  async getActiveQuiz(organizerId: string) {
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

  // Get organizer's recent/completed quizzes
  async getRecentQuizzes(organizerId: string, page = 1, limit = 10) {
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

  // Get detailed results for a completed quiz
  async getQuizResults(quizId: string, organizerId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You can only view results for your own quizzes');
    }

    // Get all sessions (both authenticated and guest)
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

    // Calculate statistics
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

    // Format participant results
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

  // Bulk Operations
  async bulkOperation(organizerId: string, bulkOperationDto: BulkOperationDto) {
    const { quizIds, operation } = bulkOperationDto;

    // Verify all quizzes belong to the organizer
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        id: { in: quizIds },
        organizerId,
      },
      select: { id: true },
    });

    if (quizzes.length !== quizIds.length) {
      throw new ForbiddenException('Some quizzes do not belong to you or do not exist');
    }

    let result;
    switch (operation) {
      case BulkOperationType.DELETE:
        result = await this.prisma.quiz.deleteMany({
          where: { id: { in: quizIds } },
        });
        break;

      case BulkOperationType.ARCHIVE:
        result = await this.prisma.quiz.updateMany({
          where: { id: { in: quizIds } },
          data: { isArchived: true, archivedAt: new Date() },
        });
        break;

      case BulkOperationType.UNARCHIVE:
        result = await this.prisma.quiz.updateMany({
          where: { id: { in: quizIds } },
          data: { isArchived: false, archivedAt: null },
        });
        break;

      case BulkOperationType.ACTIVATE:
        result = await this.prisma.quiz.updateMany({
          where: { id: { in: quizIds } },
          data: { isActive: true },
        });
        break;

      case BulkOperationType.DEACTIVATE:
        result = await this.prisma.quiz.updateMany({
          where: { id: { in: quizIds } },
          data: { isActive: false },
        });
        break;

      default:
        throw new BadRequestException('Invalid operation');
    }

    return {
      message: `Successfully performed ${operation} on ${result.count} quiz(es)`,
      count: result.count,
    };
  }

  // Export quizzes as JSON backup
  async exportQuizzes(organizerId: string, exportDto: ExportQuizzesDto) {
    const where: any = {
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
        // Remove IDs for clean import
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

  // Import quizzes from JSON backup
  async importQuizzes(organizerId: string, backupData: any) {
    try {
      const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;

      if (!backup.quizzes || !Array.isArray(backup.quizzes)) {
        throw new BadRequestException('Invalid backup format');
      }

      const importedQuizzes: any[] = [];

      for (const quizData of backup.quizzes) {
        // Generate new unique code
        let code = this.generateQuizCode();
        let existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
        
        while (existingQuiz) {
          code = this.generateQuizCode();
          existingQuiz = await this.prisma.quiz.findUnique({ where: { code } });
        }

        const { questions, ...quizFields } = quizData;

        // Create quiz with questions
        const quiz: any = await this.prisma.quiz.create({
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
              create: questions.map((q: any, index: number) => ({
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to import quizzes: ${error.message}`);
    }
  }

  // Archive a single quiz
  async archiveQuiz(quizId: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, organizerId: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You can only archive your own quizzes');
    }

    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { isArchived: true, archivedAt: new Date() },
    });

    return { message: 'Quiz archived successfully' };
  }

  // Unarchive a single quiz
  async unarchiveQuiz(quizId: string, organizerId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, organizerId: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.organizerId !== organizerId) {
      throw new ForbiddenException('You can only unarchive your own quizzes');
    }

    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { isArchived: false, archivedAt: null },
    });

    return { message: 'Quiz unarchived successfully' };
  }
}
