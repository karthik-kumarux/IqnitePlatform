export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  code: string;
  organizerId: string;
  isPublic: boolean;
  duration?: number;
  passingScore?: number;
  maxAttempts: number;
  showAnswers: boolean;
  shuffleQuestions: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  isActive: boolean;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'WAITING' | 'IN_PROGRESS';
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    questions: number;
    sessions: number;
    guestSessions?: number;
  };
}

export interface Question {
  id: string;
  quizId: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  timeLimit?: number;
  order: number;
  explanation?: string;
}

export interface QuizSession {
  id: string;
  quizId: string;
  participantId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';
  score: number;
  totalPoints: number;
  percentage?: number;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
