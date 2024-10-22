-- CreateTable
CREATE TABLE "QuizFact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "hookSentence" TEXT NOT NULL,
    "hookSenteceAudioProps" TEXT NOT NULL,
    "ctaSentence" TEXT NOT NULL,
    "backGroundProps" TEXT NOT NULL,
    "generationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizFact_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "elementQuizFact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fact" TEXT NOT NULL,
    "audioProps" TEXT NOT NULL,
    "quizFactId" INTEGER NOT NULL,
    CONSTRAINT "elementQuizFact_quizFactId_fkey" FOREIGN KEY ("quizFactId") REFERENCES "QuizFact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizFact_uuid_key" ON "QuizFact"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "QuizFact_generationId_key" ON "QuizFact"("generationId");

-- CreateIndex
CREATE INDEX "elementQuizFact_quizFactId_idx" ON "elementQuizFact"("quizFactId");
