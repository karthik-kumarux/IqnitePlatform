"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const quizzes = await prisma.quiz.findMany({
        select: {
            id: true,
            title: true,
            code: true,
            status: true,
            organizerId: true,
        },
    });
    console.log('Found quizzes:', quizzes.length);
    quizzes.forEach((quiz) => {
        console.log(`- ${quiz.title} (Code: ${quiz.code}, Status: ${quiz.status})`);
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=list-quizzes.js.map