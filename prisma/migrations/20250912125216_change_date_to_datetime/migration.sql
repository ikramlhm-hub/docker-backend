/*
  Warnings:

  - You are about to alter the column `date` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "promotion" TEXT NOT NULL,
    "classroom" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sessions" ("classroom", "createdAt", "date", "endTime", "id", "promotion", "startTime", "subject", "teacher") SELECT "classroom", "createdAt", "date", "endTime", "id", "promotion", "startTime", "subject", "teacher" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE UNIQUE INDEX "sessions_subject_date_key" ON "sessions"("subject", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
