/*
  Warnings:

  - You are about to drop the `QuizFact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `aff` on the `elementQuizAff` table. All the data in the column will be lost.
  - Added the required column `affirmation` to the `elementQuizAff` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuizFact_generationId_key";

-- DropIndex
DROP INDEX "QuizFact_uuid_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuizFact";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "QuizAff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "hookSentence" TEXT NOT NULL,
    "hookSenteceAudioProps" TEXT NOT NULL,
    "ctaSentence" TEXT NOT NULL,
    "ctaSenteceAudioProps" TEXT NOT NULL,
    "backGroundProps" TEXT NOT NULL,
    "generationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizAff_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_elementQuizAff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "affirmation" TEXT NOT NULL,
    "audioProps" TEXT NOT NULL,
    "quizAffId" INTEGER NOT NULL,
    CONSTRAINT "elementQuizAff_quizAffId_fkey" FOREIGN KEY ("quizAffId") REFERENCES "QuizAff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_elementQuizAff" ("audioProps", "id", "quizAffId") SELECT "audioProps", "id", "quizAffId" FROM "elementQuizAff";
DROP TABLE "elementQuizAff";
ALTER TABLE "new_elementQuizAff" RENAME TO "elementQuizAff";
CREATE INDEX "elementQuizAff_quizAffId_idx" ON "elementQuizAff"("quizAffId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "QuizAff_uuid_key" ON "QuizAff"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAff_generationId_key" ON "QuizAff"("generationId");
