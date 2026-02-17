import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update all quizzes without status to DRAFT
  const result = await prisma.quiz.updateMany({
    where: {
      status: null as any,
    },
    data: {
      status: 'DRAFT',
    },
  });

  console.log(`Updated ${result.count} quizzes to DRAFT status`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
