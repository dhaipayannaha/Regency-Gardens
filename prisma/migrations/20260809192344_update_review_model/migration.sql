/*
  Warnings:

  - A unique constraint covering the columns `[userId,propertyId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_propertyId_key" ON "Review"("userId", "propertyId");
