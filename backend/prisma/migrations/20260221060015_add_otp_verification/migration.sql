-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verificationOtp" TEXT,
ADD COLUMN     "verificationOtpExpires" TIMESTAMP(3);
