/*
  Warnings:

  - You are about to drop the column `email` on the `Inquiry` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Inquiry` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Inquiry` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'RESPONDED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_userId_fkey";

-- AlterTable
ALTER TABLE "Inquiry" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
