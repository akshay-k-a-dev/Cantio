-- CreateTable
CREATE TABLE "cached_popular_tracks" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "playlistCount" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cached_popular_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_cache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cached_popular_tracks_trackId_key" ON "cached_popular_tracks"("trackId");

-- CreateIndex
CREATE INDEX "cached_popular_tracks_playlistCount_idx" ON "cached_popular_tracks"("playlistCount");

-- CreateIndex
CREATE UNIQUE INDEX "system_cache_key_key" ON "system_cache"("key");
