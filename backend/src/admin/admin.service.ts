import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private statsCache: { data: any; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async getSystemStats() {
    // Check cache
    if (this.statsCache && Date.now() - this.statsCache.timestamp < this.CACHE_TTL) {
      return this.statsCache.data;
    }

    const [
      totalUsers,
      totalQuizzes,
      totalQuestions,
      totalSessions,
      activeUsers,
      recentQuizzes,
      usersByRole,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.quiz.count(),
      this.prisma.question.count(),
      this.prisma.quizSession.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.quiz.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      quizzes: {
        total: totalQuizzes,
        recentlyCreated: recentQuizzes,
      },
      questions: {
        total: totalQuestions,
      },
      sessions: {
        total: totalSessions,
      },
      timestamp: new Date().toISOString(),
    };

    // Update cache
    this.statsCache = { data: stats, timestamp: Date.now() };

    return stats;
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              quizzes: true,
              sessions: true,
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        quizzes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            code: true,
            createdAt: true,
            _count: {
              select: { questions: true, sessions: true },
            },
          },
        },
        quizSessions: {
          take: 10,
          orderBy: { startedAt: 'desc' },
          select: {
            id: true,
            score: true,
            totalPoints: true,
            completedAt: true,
            quiz: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            quizzes: true,
            quizSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(id: string, role: string) {
    const validRoles = ['ADMIN', 'ORGANIZER', 'PARTICIPANT'];
    
    if (!validRoles.includes(role)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid role provided',
        errorCode: 'INVALID_ROLE',
        validRoles,
      });
    }

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Log audit
    await this.auditLog.log({
      userId: id, // In real scenario, get current admin's ID from request
      action: 'USER_ROLE_UPDATED',
      targetType: 'User',
      targetId: id,
      details: {
        oldRole: existingUser.role,
        newRole: role,
      },
    });

    return { 
      message: 'User role updated successfully', 
      user,
      errorCode: null,
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
      },
    });

    // Log audit
    await this.auditLog.log({
      userId: id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: id,
      details: {
        oldStatus: existingUser.isActive,
        newStatus: isActive,
      },
    });

    return { 
      message: 'User status updated successfully', 
      user,
      errorCode: null,
    };
  }

  async getAllQuizzes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              questions: true,
              sessions: true,
            },
          },
        },
      }),
      this.prisma.quiz.count(),
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

  async getRecentActivity(limit = 50) {
    const [recentQuizzes, recentSessions] = await Promise.all([
      this.prisma.quiz.findMany({
        take: Math.floor(limit / 2),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          organizer: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.quizSession.findMany({
        take: Math.floor(limit / 2),
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          score: true,
          startedAt: true,
          participant: {
            select: {
              username: true,
            },
          },
          quiz: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    const activity = [
      ...recentQuizzes.map((q) => ({
        type: 'quiz_created' as const,
        timestamp: q.createdAt,
        user: q.organizer.username,
        details: `Created quiz: ${q.title}`,
      })),
      ...recentSessions.map((s) => ({
        type: 'quiz_completed' as const,
        timestamp: s.startedAt,
        user: s.participant.username,
        details: `Completed quiz: ${s.quiz.title} (Score: ${s.score})`,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

    return activity;
  }

  async createUser(createUserDto: CreateAdminUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUserDto.email }, { username: createUserDto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        isActive: true,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { message: 'User created successfully', user };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // Soft delete by deactivating
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Log audit
    await this.auditLog.log({
      userId: id,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: id,
      details: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    return { 
      message: 'User deleted successfully',
      errorCode: null,
    };
  }

  async searchUsers(searchTerm: string, role?: string, isActive?: boolean, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              quizzes: true,
              sessions: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async bulkUpdateUserRole(userIds: string[], role: string) {
    const validRoles = ['ADMIN', 'ORGANIZER', 'PARTICIPANT'];
    
    if (!validRoles.includes(role)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid role provided',
        errorCode: 'INVALID_ROLE',
      });
    }

    // Use transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { role: role as any },
      });

      // Log audit for bulk operation
      await tx.auditLog.create({
        data: {
          userId: userIds[0], // Admin ID should come from request context
          action: 'BULK_USER_ROLE_UPDATE',
          targetType: 'User',
          details: {
            userIds,
            newRole: role,
            count: userIds.length,
          },
        },
      });
    });

    return { 
      message: `${userIds.length} users updated successfully`,
      errorCode: null,
    };
  }

  async bulkUpdateUserStatus(userIds: string[], isActive: boolean) {
    // Use transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive },
      });

      // Log audit for bulk operation
      await tx.auditLog.create({
        data: {
          userId: userIds[0], // Admin ID should come from request context
          action: isActive ? 'BULK_USER_ACTIVATION' : 'BULK_USER_DEACTIVATION',
          targetType: 'User',
          details: {
            userIds,
            newStatus: isActive,
            count: userIds.length,
          },
        },
      });
    });

    return { 
      message: `${userIds.length} users ${isActive ? 'activated' : 'deactivated'} successfully`,
      errorCode: null,
    };
  }

  // Advanced Analytics
  async getAdvancedAnalytics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      quizGrowth,
      sessionGrowth,
      topOrganizers,
      topParticipants,
      quizPerformance,
    ] = await Promise.all([
      // User growth last 30 days
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          createdAt: { gte: last30Days },
        },
      }),
      // Quiz creation trend
      this.prisma.quiz.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          createdAt: { gte: last30Days },
        },
      }),
      // Session activity
      this.prisma.quizSession.groupBy({
        by: ['startedAt'],
        _count: true,
        where: {
          startedAt: { gte: last30Days },
        },
      }),
      // Top quiz creators
      this.prisma.user.findMany({
        where: { role: 'ORGANIZER' },
        select: {
          id: true,
          username: true,
          _count: {
            select: { quizzes: true },
          },
        },
        orderBy: {
          quizzes: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      // Most active participants
      this.prisma.user.findMany({
        where: { role: 'PARTICIPANT' },
        select: {
          id: true,
          username: true,
          _count: {
            select: { quizSessions: true },
          },
        },
        orderBy: {
          quizSessions: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      // Quiz performance metrics
      this.prisma.quizSession.aggregate({
        _avg: {
          score: true,
          percentage: true,
          timeSpent: true,
        },
        _count: true,
        where: {
          completedAt: { not: null },
        },
      }),
    ]);

    return {
      userGrowth: this.aggregateByDay(userGrowth, last30Days),
      quizGrowth: this.aggregateByDay(quizGrowth, last30Days),
      sessionGrowth: this.aggregateByDay(sessionGrowth, last30Days),
      topOrganizers: topOrganizers.map(o => ({
        id: o.id,
        username: o.username,
        quizzesCreated: o._count.quizzes,
      })),
      topParticipants: topParticipants.map(p => ({
        id: p.id,
        username: p.username,
        quizzesTaken: p._count.quizSessions,
      })),
      averagePerformance: {
        avgScore: quizPerformance._avg.score || 0,
        avgPercentage: quizPerformance._avg.percentage || 0,
        avgTimeSpent: quizPerformance._avg.timeSpent || 0,
        totalCompletedSessions: quizPerformance._count,
      },
    };
  }

  private aggregateByDay(data: any[], startDate: Date) {
    const dayMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize all days with 0
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, 0);
    }
    
    // Fill in actual counts
    data.forEach(item => {
      const date = new Date(item.createdAt || item.startedAt);
      const key = date.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + item._count);
    });
    
    return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  }

  // Get audit logs
  async getAuditLogs(page = 1, limit = 50) {
    return this.auditLog.getRecentLogs(limit, page);
  }

  // Quiz Management
  async deleteQuiz(quizId: string, adminId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    
    if (!quiz) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Quiz not found',
        errorCode: 'QUIZ_NOT_FOUND',
      });
    }

    await this.prisma.quiz.delete({ where: { id: quizId } });

    // Log audit
    await this.auditLog.log({
      userId: adminId,
      action: 'QUIZ_DELETED',
      targetType: 'Quiz',
      targetId: quizId,
      details: {
        title: quiz.title,
        organizerId: quiz.organizerId,
      },
    });

    return { 
      message: 'Quiz deleted successfully',
      errorCode: null,
    };
  }

  async transferQuizOwnership(quizId: string, newOrganizerId: string, adminId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    
    if (!quiz) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Quiz not found',
        errorCode: 'QUIZ_NOT_FOUND',
      });
    }

    const newOrganizer = await this.prisma.user.findUnique({ where: { id: newOrganizerId } });
    
    if (!newOrganizer || newOrganizer.role !== 'ORGANIZER') {
      throw new BadRequestException({
        statusCode: 400,
        message: 'New organizer must have ORGANIZER role',
        errorCode: 'INVALID_ORGANIZER',
      });
    }

    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { organizerId: newOrganizerId },
    });

    // Log audit
    await this.auditLog.log({
      userId: adminId,
      action: 'QUIZ_OWNERSHIP_TRANSFERRED',
      targetType: 'Quiz',
      targetId: quizId,
      details: {
        title: quiz.title,
        oldOrganizerId: quiz.organizerId,
        newOrganizerId,
      },
    });

    return { 
      message: 'Quiz ownership transferred successfully',
      errorCode: null,
    };
  }

  // Password Reset Initiation
  async initiatePasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't reveal if user exists
      return { 
        message: 'If the email exists, a password reset link has been sent',
        errorCode: null,
      };
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // TODO: Send email with reset link
    // For now, return token (in production, send via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { 
      message: 'If the email exists, a password reset link has been sent',
      errorCode: null,
      // Remove this in production:
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid or expired reset token',
        errorCode: 'INVALID_RESET_TOKEN',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { 
      message: 'Password reset successfully',
      errorCode: null,
    };
  }
}
