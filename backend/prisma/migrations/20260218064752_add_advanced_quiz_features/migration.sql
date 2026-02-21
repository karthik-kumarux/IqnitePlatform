-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "enableAdaptiveDifficulty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionPoolSize" INTEGER,
ADD COLUMN     "questionPoolTags" TEXT[],
ADD COLUMN     "randomizeOptions" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- CreateIndex
CREATE INDEX "questions_tags_idx" ON "questions"("tags");
