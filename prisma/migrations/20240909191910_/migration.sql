-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Generation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Generation" ("compositionId", "createdAt", "id", "updatedAt", "uuid") SELECT "compositionId", "createdAt", "id", "updatedAt", "uuid" FROM "Generation";
DROP TABLE "Generation";
ALTER TABLE "new_Generation" RENAME TO "Generation";
CREATE UNIQUE INDEX "Generation_uuid_key" ON "Generation"("uuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
