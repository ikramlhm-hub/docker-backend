/*
  Warnings:

  - You are about to drop the `_SessionToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `promotion` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_SessionToUser_B_index";

-- DropIndex
DROP INDEX "_SessionToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SessionToUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotion" TEXT NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "firstname", "id", "isActive", "lastname") SELECT "createdAt", "email", "firstname", "id", "isActive", "lastname" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
