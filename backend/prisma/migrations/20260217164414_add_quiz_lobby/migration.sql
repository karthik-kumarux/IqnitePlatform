-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'WAITING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "lobby_participants" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lobby_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lobby_participants_quizId_idx" ON "lobby_participants"("quizId");

-- AddForeignKey
ALTER TABLE "lobby_participants" ADD CONSTRAINT "lobby_participants_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
