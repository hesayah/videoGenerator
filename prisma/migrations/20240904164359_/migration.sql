/*
  Warnings:

  - You are about to drop the column `answer` on the `QuizAff` table. All the data in the column will be lost.
  - You are about to drop the column `characterName` on the `QuizAff` table. All the data in the column will be lost.
  - Added the required column `themeQuiz` to the `QuizAff` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuizAff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "themeQuiz" TEXT NOT NULL,
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
INSERT INTO "new_QuizAff" ("backGroundProps", "createdAt", "ctaSenteceAudioProps", "ctaSentence", "generationId", "hookSenteceAudioProps", "hookSentence", "id", "updatedAt", "uuid") SELECT "backGroundProps", "createdAt", "ctaSenteceAudioProps", "ctaSentence", "generationId", "hookSenteceAudioProps", "hookSentence", "id", "updatedAt", "uuid" FROM "QuizAff";
DROP TABLE "QuizAff";
ALTER TABLE "new_QuizAff" RENAME TO "QuizAff";
CREATE UNIQUE INDEX "QuizAff_uuid_key" ON "QuizAff"("uuid");
CREATE UNIQUE INDEX "QuizAff_generationId_key" ON "QuizAff"("generationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
