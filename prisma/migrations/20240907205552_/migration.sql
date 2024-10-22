/*
  Warnings:

  - Added the required column `ctaSenteceAudioProps` to the `QuizMultiple` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuizMultiple" (
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
    CONSTRAINT "QuizMultiple_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuizMultiple" ("backGroundProps", "createdAt", "ctaSentence", "generationId", "hookSenteceAudioProps", "hookSentence", "id", "themeQuiz", "updatedAt", "uuid") SELECT "backGroundProps", "createdAt", "ctaSentence", "generationId", "hookSenteceAudioProps", "hookSentence", "id", "themeQuiz", "updatedAt", "uuid" FROM "QuizMultiple";
DROP TABLE "QuizMultiple";
ALTER TABLE "new_QuizMultiple" RENAME TO "QuizMultiple";
CREATE UNIQUE INDEX "QuizMultiple_uuid_key" ON "QuizMultiple"("uuid");
CREATE UNIQUE INDEX "QuizMultiple_generationId_key" ON "QuizMultiple"("generationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
