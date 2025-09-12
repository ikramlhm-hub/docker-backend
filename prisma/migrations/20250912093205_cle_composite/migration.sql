/*
  Warnings:

  - A unique constraint covering the columns `[subject,date]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sessions_subject_date_key" ON "sessions"("subject", "date");
