/*
  Warnings:

  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `hour` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matiere` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "matiere" TEXT NOT NULL,
    "classroom" TEXT NOT NULL,
    "teacher" TEXT NOT NULL
);
INSERT INTO "new_sessions" ("classroom", "id", "subject", "teacher") SELECT "classroom", "id", "subject", "teacher" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE UNIQUE INDEX "sessions_subject_key" ON "sessions"("subject");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
