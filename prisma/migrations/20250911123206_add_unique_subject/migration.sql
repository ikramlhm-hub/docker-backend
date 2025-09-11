/*
  Warnings:

  - A unique constraint covering the columns `[subject]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sessions_subject_key" ON "sessions"("subject");
