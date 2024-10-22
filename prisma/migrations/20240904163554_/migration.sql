/*
  Warnings:

  - You are about to drop the `elementQuizFact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "elementQuizFact";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "elementQuizAff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aff" TEXT NOT NULL,
    "audioProps" TEXT NOT NULL,
    "quizAffId" INTEGER NOT NULL,
    CONSTRAINT "elementQuizAff_quizAffId_fkey" FOREIGN KEY ("quizAffId") REFERENCES "QuizFact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "elementQuizAff_quizAffId_idx" ON "elementQuizAff"("quizAffId");
