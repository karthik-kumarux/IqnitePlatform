"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const result = await prisma.quiz.updateMany({
        where: {
            status: null,
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
//# sourceMappingURL=update-quiz-status.js.map