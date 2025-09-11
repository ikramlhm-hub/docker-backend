/*
  Warnings:

  - You are about to drop the column `classroom` on the `sessions` table. All the data in the column will be lost.

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
    "teacher" TEXT NOT NULL
);
INSERT INTO "new_sessions" ("hour", "id", "matiere", "room", "subject", "teacher") SELECT "hour", "id", "matiere", "room", "subject", "teacher" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE UNIQUE INDEX "sessions_subject_key" ON "sessions"("subject");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
