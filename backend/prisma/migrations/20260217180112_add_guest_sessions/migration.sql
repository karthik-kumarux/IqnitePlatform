-- CreateTable
CREATE TABLE "guest_quiz_sessions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,

    CONSTRAINT "guest_quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_quiz_sessions_sessionId_key" ON "guest_quiz_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "guest_quiz_sessions_quizId_idx" ON "guest_quiz_sessions"("quizId");

-- CreateIndex
CREATE INDEX "guest_quiz_sessions_sessionId_idx" ON "guest_quiz_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "guest_answers_sessionId_idx" ON "guest_answers"("sessionId");

-- CreateIndex
CREATE INDEX "guest_answers_questionId_idx" ON "guest_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "guest_answers_sessionId_questionId_key" ON "guest_answers"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "guest_quiz_sessions" ADD CONSTRAINT "guest_quiz_sessions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_answers" ADD CONSTRAINT "guest_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "guest_quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_answers" ADD CONSTRAINT "guest_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
