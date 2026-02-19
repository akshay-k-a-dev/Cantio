# Database Normalization Document

## Scope

Normalization analysis based on the Prisma schema diagram (music
playlist/social listening app).

------------------------------------------------------------------------

## 1. Core Entities (Already in good 3NF)

### Users

**PK:** id\
Attributes: username, email, password, name, avatar, createdAt,
updatedAt

-   Atomic attributes ✔
-   No partial dependency ✔
-   No transitive dependency ✔

**Status:** 3NF

------------------------------------------------------------------------

### Playlists

**PK:** id\
**FK:** userId → users.id

Attributes: name, description, thumbnail, isPublic, createdAt, updatedAt

-   Depends fully on PK ✔
-   Owner separated via FK ✔

**Status:** 3NF

------------------------------------------------------------------------

### Playlist_Tracks

**PK:** id\
**FK:** playlistId → playlists.id

Attributes: trackId, title, artist, thumbnail, duration, position,
addedAt

⚠ Problem: - track metadata duplicated across multiple tables

**Fix for higher normalization:**

Create:

**Tracks** - trackId (PK) - title - artist - thumbnail - duration

Then:

Playlist_Tracks → store only: - id - playlistId - trackId - position -
addedAt

**Status:** Currently 2NF → Should be 3NF after refactor

------------------------------------------------------------------------

### Liked_Tracks

**PK:** id\
**FK:** userId → users.id

Attributes: trackId, title, artist, thumbnail, duration, likedAt

⚠ Same duplication issue

**Normalize:** store only: - id - userId - trackId - likedAt

Metadata should live in **Tracks** table.

**Status:** 2NF → Needs Tracks table

------------------------------------------------------------------------

### Play_History

**PK:** id\
**FK:** userId → users.id

Attributes: trackId, title, artist, thumbnail, duration, playedAt

⚠ Same duplication

**Normalized version:** - id - userId - trackId - playedAt

**Status:** 2NF → Needs Tracks table

------------------------------------------------------------------------

### Recommendations

**PK:** id\
**FK:** userId → users.id

Attributes: trackId, title, artist, thumbnail, duration, source, score,
playCount, likedAt, lastPlayedAt, createdAt, updatedAt

⚠ Heavy duplication of track metadata

**Normalized structure** - id - userId - trackId - source - score -
playCount - likedAt - lastPlayedAt - createdAt - updatedAt

**Status:** 2NF → Needs Tracks table

------------------------------------------------------------------------

### Blends

**PK:** id\
**FK:** user1Id, user2Id → users.id

Attributes: name, playlistId, createdAt, updatedAt

**Status:** 3NF

------------------------------------------------------------------------

### Blend_Tracks

**PK:** id\
**FK:** blendId → blends.id

Attributes: trackId, title, artist, thumbnail, duration, position,
sourceUserId, addedAt

⚠ Again duplicates track metadata

**Normalized** - id - blendId - trackId - position - sourceUserId -
addedAt

**Status:** 2NF → Needs Tracks table

------------------------------------------------------------------------

### Blend_Invites

**PK:** id\
**FK:** senderId, receiverId → users.id

Attributes: status, respondedAt, createdAt

**Status:** 3NF

------------------------------------------------------------------------

## 2. System Tables (Ignore for normalization)

-   \_prisma_migrations
-   system_cache
-   pg_stat_statements
-   pg_stat_statements_info
-   cached_popular_tracks

These are infrastructure/internal tables.

------------------------------------------------------------------------

## 3. Final Normalized Design (Recommended)

### Tracks (NEW MASTER TABLE)

-   trackId (PK)
-   title
-   artist
-   thumbnail
-   duration

### Relationship tables referencing Tracks

-   playlist_tracks
-   liked_tracks
-   play_history
-   recommendations
-   blend_tracks

Each should store only: - their PK - FK to user/playlist/blend - FK
trackId - event-specific fields (likedAt, position, etc.)

------------------------------------------------------------------------

## 4. Normal Form Summary

  Table             Current NF   After Fix
  ----------------- ------------ -----------
  users             3NF          3NF
  playlists         3NF          3NF
  playlist_tracks   2NF          3NF
  liked_tracks      2NF          3NF
  play_history      2NF          3NF
  recommendations   2NF          3NF
  blends            3NF          3NF
  blend_tracks      2NF          3NF
  blend_invites     3NF          3NF

------------------------------------------------------------------------

## 5. Key Takeaway

The schema is structurally good but **violates 3NF due to repeated track
metadata** across many tables.

**Single Tracks table fixes most redundancy, improves consistency, and
reduces storage.**
