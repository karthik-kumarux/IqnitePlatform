import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearOldImageUrls() {
  console.log('🔍 Checking for old file-based imageUrls...');
  
  // Find questions with file-based imageUrls (not base64)
  const questions = await prisma.question.findMany({
    where: {
      imageUrl: {
        not: null,
        contains: '/uploads/',
      },
    },
    select: {
      id: true,
      question: true,
      imageUrl: true,
    },
  });

  console.log(`📋 Found ${questions.length} questions with old file-based images`);

  if (questions.length === 0) {
    console.log('✅ No old image URLs to clear!');
    await prisma.$disconnect();
    return;
  }

  // Clear old imageUrls
  const result = await prisma.question.updateMany({
    where: {
      imageUrl: {
        contains: '/uploads/',
      },
    },
    data: {
      imageUrl: null,
    },
  });

  console.log(`✅ Cleared ${result.count} old image URLs`);
  console.log('💡 You can now upload new images which will be stored as base64');

  await prisma.$disconnect();
}

clearOldImageUrls()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
