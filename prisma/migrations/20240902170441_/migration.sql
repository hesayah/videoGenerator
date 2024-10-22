-- CreateTable
CREATE TABLE "Generation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuizMultiple" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "themeQuiz" TEXT NOT NULL,
    "hookSentence" TEXT NOT NULL,
    "hookSenteceAudioProps" TEXT NOT NULL,
    "ctaSentence" TEXT NOT NULL,
    "backGroundProps" TEXT NOT NULL,
    "generationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuizMultiple_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "elementQuizMultiple" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctAnswerIndex" INTEGER NOT NULL,
    "imgSrc" TEXT,
    "audioProps" TEXT NOT NULL,
    "answerAudioProps" TEXT NOT NULL,
    "quizMultipleId" INTEGER NOT NULL,
    CONSTRAINT "elementQuizMultiple_quizMultipleId_fkey" FOREIGN KEY ("quizMultipleId") REFERENCES "QuizMultiple" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizWhoIAm" (
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
    CONSTRAINT "QuizWhoIAm_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "elementQuizWhoIAm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fact" TEXT NOT NULL,
    "audioProps" TEXT NOT NULL,
    "quizWhoIAmId" INTEGER NOT NULL,
    CONSTRAINT "elementQuizWhoIAm_quizWhoIAmId_fkey" FOREIGN KEY ("quizWhoIAmId") REFERENCES "QuizWhoIAm" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterName" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characterName" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Story" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storyContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Initied',
    "generationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "storyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scene_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "descriptionPrompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "audioProps" TEXT NOT NULL,
    "sceneId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Segment_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CinematicProps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "context" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "colorPalette" TEXT NOT NULL,
    "lighting" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "characterDesign" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "storyId" INTEGER NOT NULL,
    CONSTRAINT "CinematicProps_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Generation_uuid_key" ON "Generation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "QuizMultiple_uuid_key" ON "QuizMultiple"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "QuizMultiple_generationId_key" ON "QuizMultiple"("generationId");

-- CreateIndex
CREATE INDEX "elementQuizMultiple_quizMultipleId_idx" ON "elementQuizMultiple"("quizMultipleId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizWhoIAm_uuid_key" ON "QuizWhoIAm"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "QuizWhoIAm_generationId_key" ON "QuizWhoIAm"("generationId");

-- CreateIndex
CREATE INDEX "elementQuizWhoIAm_quizWhoIAmId_idx" ON "elementQuizWhoIAm"("quizWhoIAmId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_uuid_key" ON "Story"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Story_generationId_key" ON "Story"("generationId");

-- CreateIndex
CREATE INDEX "Scene_uuid_idx" ON "Scene"("uuid");

-- CreateIndex
CREATE INDEX "Scene_storyId_idx" ON "Scene"("storyId");

-- CreateIndex
CREATE INDEX "Segment_uuid_idx" ON "Segment"("uuid");

-- CreateIndex
CREATE INDEX "Segment_sceneId_idx" ON "Segment"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "CinematicProps_storyId_key" ON "CinematicProps"("storyId");
