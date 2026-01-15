-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "isLiked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPlayedAt" TIMESTAMP(3),
ADD COLUMN     "likedAt" TIMESTAMP(3),
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "blend_invites" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "blend_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blends" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "playlistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blend_tracks" (
    "id" TEXT NOT NULL,
    "blendId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "sourceUserId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blend_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blend_invites_receiverId_status_idx" ON "blend_invites"("receiverId", "status");

-- CreateIndex
CREATE INDEX "blend_invites_senderId_idx" ON "blend_invites"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "blend_invites_senderId_receiverId_key" ON "blend_invites"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "blends_playlistId_key" ON "blends"("playlistId");

-- CreateIndex
CREATE INDEX "blends_user1Id_idx" ON "blends"("user1Id");

-- CreateIndex
CREATE INDEX "blends_user2Id_idx" ON "blends"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "blends_user1Id_user2Id_key" ON "blends"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "blend_tracks_blendId_idx" ON "blend_tracks"("blendId");

-- CreateIndex
CREATE UNIQUE INDEX "blend_tracks_blendId_trackId_key" ON "blend_tracks"("blendId", "trackId");

-- CreateIndex
CREATE INDEX "recommendations_playCount_idx" ON "recommendations"("playCount");

-- CreateIndex
CREATE INDEX "recommendations_lastPlayedAt_idx" ON "recommendations"("lastPlayedAt");

-- AddForeignKey
ALTER TABLE "blend_invites" ADD CONSTRAINT "blend_invites_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blend_invites" ADD CONSTRAINT "blend_invites_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blends" ADD CONSTRAINT "blends_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blends" ADD CONSTRAINT "blends_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blends" ADD CONSTRAINT "blends_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blend_tracks" ADD CONSTRAINT "blend_tracks_blendId_fkey" FOREIGN KEY ("blendId") REFERENCES "blends"("id") ON DELETE CASCADE ON UPDATE CASCADE;
