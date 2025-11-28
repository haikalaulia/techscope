/*
  Warnings:

  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `isVerify` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoUrl" TEXT,
ALTER COLUMN "role" SET DEFAULT 'user',
ALTER COLUMN "isVerify" SET NOT NULL,
ALTER COLUMN "isVerify" SET DEFAULT false;

-- DropTable
DROP TABLE "posts";
