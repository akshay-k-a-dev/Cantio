import Innertube from 'youtubei.js';

let youtube: Innertube | null = null;
let youtubeMusicClient: Innertube | null = null;

async function getYouTube() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

async function getYouTubeMusic() {
  if (!youtubeMusicClient) {
    youtubeMusicClient = await Innertube.create({ client_type: 'WEB_REMIX' } as any);
  }
  return youtubeMusicClient;
}

export interface VideoResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}

export interface MusicPlaylistResult {
  type: 'playlist';
  playlistId: string;
  title: string;
  author: string;
  thumbnail: string;
  trackCount?: number;
}

export interface MusicAlbumResult {
  type: 'album';
  browseId: string;
  title: string;
  artist: string;
  thumbnail: string;
  year?: string;
}

export interface MusicArtistResult {
  type: 'artist';
  browseId: string;
  name: string;
  thumbnail: string;
  subscribers?: string;
}

export type MusicSearchType = 'playlists' | 'albums' | 'artists';
export type MusicSearchResult = MusicPlaylistResult | MusicAlbumResult | MusicArtistResult;

// ─── Shared utilities ────────────────────────────────────────────────────────

/** Safely extract a plain string from a youtubei.js Text / string value */
function getText(t: any): string {
  if (!t) return '';
  if (typeof t === 'string') return t;
  if (t.text && typeof t.text === 'string') return t.text;
  if (Array.isArray(t.runs)) return t.runs.map((r: any) => r?.text || '').join('');
  const s = String(t);
  return s === '[object Object]' ? '' : s;
}

function getThumbnailUrl(thumbnails: any): string {
  if (!thumbnails) return '';
  if (Array.isArray(thumbnails)) {
    return thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || '';
  }
  if (thumbnails.url) return thumbnails.url;
  return '';
}

function normalizeTitleKey(title?: string): string {
  const base = title?.toLowerCase() || '';
  return base
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Centralized artist extraction ───────────────────────────────────────────

/**
 * cleanArtistName()
 *
 * Strips YouTube's " - Topic" suffix from auto-generated topic channels
 * so that "Taylor Swift - Topic" becomes "Taylor Swift".
 */
function cleanArtistName(name: string): string {
  return name.replace(/\s*-\s*Topic$/i, '').trim();
}

/**
 * extractArtistFromItem()
 *
 * Attempts to pull an artist name from any Innertube item shape.
 * Covers both regular YouTube (WEB) and YouTube Music (WEB_REMIX) item formats.
 *
 * Priority order (matches spec):
 *   1. item.artists[] — YTM MusicResponsiveListItem
 *   2. item.authors[] — alternate YTM array format
 *   3. item.byline    — YTM watchNext items
 *   4. item.author    — regular YT items (may be Text node or {name})
 *   5. item.uploader  — alternate YT field
 *   6. item.channel   — alternate YT field
 *   7. item.flex_columns — YTM MusicResponsiveListItem secondary column
 *   8. item.subtitle  — YTM secondary info row
 *   9. item.ownerText — legacy YT data
 *  10. '' (caller decides on fallback)
 */
function extractArtistFromItem(item: any): string {
  if (!item) return '';

  // 1. YTM artists[] array (MusicResponsiveListItem from WEB_REMIX)
  if (Array.isArray(item.artists) && item.artists.length > 0) {
    const names = item.artists
      .map((a: any) => {
        const n = a?.name;
        if (typeof n === 'string' && n.trim()) return n.trim();
        const t = getText(a);
        // reject fallback garbage from getText
        if (t && t !== '[object Object]') return t;
        return '';
      })
      .filter(Boolean);
    if (names.length > 0) return cleanArtistName(names.join(', '));
  }

  // 2. authors[] — alternate YTM format (MusicCardShelfItem, etc.)
  if (Array.isArray(item.authors) && item.authors.length > 0) {
    const names = item.authors
      .map((a: any) => {
        const n = a?.name;
        if (typeof n === 'string' && n.trim()) return n.trim();
        const t = getText(a);
        // reject fallback garbage from getText
        if (t && t !== '[object Object]') return t;
        return '';
      })
      .filter(Boolean);
    if (names.length > 0) return cleanArtistName(names.join(', '));
  }

  // 3. byline — YTM watchNext sidebar items
  const byline = getText(item.byline);
  if (byline) return cleanArtistName(byline);

  // 4. author — regular YT items (can be a Text object OR {name: string})
  if (item.author) {
    const authorName = item.author?.name || getText(item.author);
    if (authorName) return cleanArtistName(authorName);
  }

  // 5. uploader — alternate YT field name
  if (item.uploader) {
    const uploaderName = item.uploader?.name || getText(item.uploader);
    if (uploaderName) return cleanArtistName(uploaderName);
  }

  // 6. channel — another alternate YT field
  if (item.channel) {
    const channelName = item.channel?.name || getText(item.channel);
    if (channelName) return cleanArtistName(channelName);
  }

  // 7. flex_columns — YTM MusicResponsiveListItem stores artist in secondary columns
  if (Array.isArray(item.flex_columns) && item.flex_columns.length > 1) {
    for (let i = 1; i < item.flex_columns.length; i++) {
      const col = item.flex_columns[i];
      const colText = getText(col?.title) || getText(col?.text);
      if (colText) {
        // Take first segment before bullet separator — usually the artist name
        const firstPart = colText.split('•')[0].split('·')[0].trim();
        if (firstPart && firstPart.toLowerCase() !== 'song' && firstPart.toLowerCase() !== 'video') {
          return cleanArtistName(firstPart);
        }
      }
    }
  }

  // 8. subtitle — YTM items often carry "Artist • Album • Year" here
  const subtitle = getText(item.subtitle);
  if (subtitle) {
    // Take only the part before the first separator bullet
    const firstPart = subtitle.split('•')[0].split('·')[0].trim();
    // Filter out generic type labels like "Song", "Video"
    if (firstPart && firstPart.toLowerCase() !== 'song' && firstPart.toLowerCase() !== 'video') {
      return cleanArtistName(firstPart);
    }
    // Try second segment if first was a type label
    const segments = subtitle.split(/[•·]/).map((s: string) => s.trim()).filter(Boolean);
    if (segments.length > 1) {
      return cleanArtistName(segments[1]);
    }
  }

  // 9. ownerText — legacy YouTube data format
  const ownerText = getText(item.ownerText);
  if (ownerText) return cleanArtistName(ownerText);

  return '';
}

// ─── Centralized normalizeTrack() ────────────────────────────────────────────

/**
 * normalizeTrack()
 *
 * THE single entry-point for all track objects entering:
 *   queue / history / likes / recommendations / playlists
 *
 * Guarantees the output shape:
 *   { videoId, title, artist, thumbnail, duration }
 *
 * @param item        Raw Innertube item (any format)
 * @param fallbacks   Optional precomputed values (e.g. album-level artist)
 *
 * Returns null if the track cannot be meaningfully identified (no videoId or title).
 */
export function normalizeTrack(
  item: any,
  fallbacks?: { artist?: string; thumbnail?: string }
): VideoResult | null {
  if (!item) return null;

  const videoId: string = item.id || item.video_id || item.videoId || '';
  if (!videoId) return null;

  const title = getText(item.title);
  if (!title) return null;

  // Artist: try item-level extraction first, then caller-provided fallback
  let artist = extractArtistFromItem(item);
  const isInvalidArtist =
    !artist ||
    artist.toUpperCase() === 'N/A' ||
    artist.toLowerCase() === 'unknown' ||
    artist.toLowerCase() === 'unknown artist' ||
    /^\d+:\d+$/.test(artist);

  if (isInvalidArtist && fallbacks?.artist) {
    artist = fallbacks.artist;
  }
  if (!artist || artist.toUpperCase() === 'N/A') {
    artist = 'Unknown Artist';
  }
  // Always clean "- Topic" suffix from final artist name
  artist = cleanArtistName(artist);

  // Thumbnail
  const thumbnail =
    getThumbnailUrl(item.thumbnail?.contents || item.thumbnail) ||
    fallbacks?.thumbnail ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const duration: number = item.duration?.seconds || item.length_seconds || 0;

  return { videoId, title, artist, duration, thumbnail };
}

// ─── Shared dedup helpers ─────────────────────────────────────────────────────

function extractItemsFromSource(source: any): any[] {
  if (!source) return [];
  const buckets: any[] = [];
  if (Array.isArray(source)) buckets.push(source);
  if (Array.isArray(source.items)) buckets.push(source.items);
  if (Array.isArray(source.contents)) buckets.push(source.contents);
  if (Array.isArray(source.playlist?.items)) buckets.push(source.playlist.items);
  if (Array.isArray(source.playlist?.contents)) buckets.push(source.playlist.contents);
  if (Array.isArray(source.tabs)) {
    buckets.push(source.tabs.flatMap((tab: any) => tab?.content?.contents || tab?.contents || []));
  }
  if (Array.isArray(source.sections)) {
    buckets.push(source.sections.flatMap((section: any) => section?.contents || []));
  }
  return buckets.flat();
}

// ─── Public API ───────────────────────────────────────────────────────────────

// ─── Shared content filter helpers ────────────────────────────────────────────

const BLACKLIST_KEYWORDS = [
  'interview', 'podcast', 'reaction', 'review', 'analysis',
  'trailer', 'teaser', 'explanation', 'news', 'case',
  'arrest', 'arrested', 'mla', 'court', 'crime', 'police',
  'exclusive', 'reporter', 'debate', 'breaking', 'politics',
  'geopolitics', 'documentary', 'vlog', 'comedy', 'sketch',
  'prank', 'challenge', 'gaming', 'walkthrough', 'speedrun',
  'mod showcase', 'gameplay', 'stream highlights', 'tv'
];

const MIN_DURATION = 60;
const MAX_DURATION = 600;

function isValidMusicTrack(video: VideoResult): boolean {
  if (video.duration && (video.duration < MIN_DURATION || video.duration > MAX_DURATION)) return false;
  const titleLower = video.title.toLowerCase();
  const artistLower = video.artist.toLowerCase();
  return !BLACKLIST_KEYWORDS.some(keyword =>
    titleLower.includes(keyword) || artistLower.includes(keyword)
  );
}

/**
 * searchMusicSongs()
 *
 * Uses the YouTube Music (WEB_REMIX) client to search for songs.
 * These results are higher quality for music — proper artist names, no
 * vlogs/podcasts, and official song metadata from YT Music's catalog.
 *
 * Returns top `limit` song results from YT Music.
 */
export async function searchMusicSongs(query: string, limit: number = 10): Promise<VideoResult[]> {
  const yt = await getYouTubeMusic();

  try {
    let page = await (yt as any).music.search(query, { type: 'song' });
    const items: any[] = page?.contents?.flatMap((section: any) => section?.contents || section?.items || [])
      ?? page?.items
      ?? [];

    const results: VideoResult[] = [];
    const seen = new Set<string>();
    const seenTitles = new Set<string>();

    const processItems = (itemList: any[]) => {
      for (const item of itemList) {
        if (results.length >= limit) break;
        if (!item) continue;

        const normalized = normalizeTrack(item);
        if (!normalized) continue;
        if (seen.has(normalized.videoId)) continue;

        // Title-level dedup
        const titleKey = normalizeTitleKey(normalized.title);
        if (seenTitles.has(titleKey)) continue;

        // Duration filter (if duration is 0, let it through — YTM sometimes omits duration)
        if (normalized.duration > 0 && !isValidMusicTrack(normalized)) continue;

        seen.add(normalized.videoId);
        seenTitles.add(titleKey);
        results.push(normalized);
      }
    };

    processItems(items);

    // Page through continuations if more results are needed
    let continuationCount = 0;
    while (page?.has_continuation && results.length < limit && continuationCount < 5 && typeof page.getContinuation === 'function') {
      try {
        continuationCount++;
        page = await page.getContinuation();
        const nextItems = page?.contents?.flatMap((section: any) => section?.contents || section?.items || [])
          ?? page?.contents
          ?? page?.items
          ?? [];
        if (!nextItems || nextItems.length === 0) break;
        processItems(nextItems);
      } catch (contError) {
        console.warn('[youtube.ts] Search continuation error:', contError);
        break;
      }
    }

    return results;
  } catch (error) {
    console.warn('[youtube.ts] YT Music song search failed:', error);
    return [];
  }
}

/**
 * search()
 *
 * Combined search: YT Music songs (top priority) + regular YouTube videos.
 * YT Music results come first (up to `limit`), then remaining slots are filled
 * with regular YouTube results, deduped by title key.
 */
export async function search(query: string, limit: number = 10): Promise<VideoResult[]> {
  // 1. Fetch YT Music songs (top priority)
  const ytMusicResults = await searchMusicSongs(query, limit);

  // If YT Music already fills all slots, return early
  if (ytMusicResults.length >= limit) {
    return ytMusicResults.slice(0, limit);
  }

  // 2. Fetch regular YouTube videos to fill remaining slots
  const yt = await getYouTube();
  const results = await yt.search(query, { type: 'video' });
  
  const mapped: VideoResult[] = (results.videos as any[])
    .filter((video: any) => video && video.id && video.title)
    .map((video: any): VideoResult => {
      const normalized = normalizeTrack({
        id: video.id,
        title: video.title,
        author: video.author,
        thumbnail: video.best_thumbnail || video.thumbnail,
        duration: video.duration,
      });
      return normalized ?? {
        videoId: video.id,
        title: getText(video.title) || 'Unknown Title',
        artist: 'Unknown Artist',
        duration: video.duration?.seconds || 0,
        thumbnail: video.best_thumbnail?.url || '',
      };
    })
    .filter(isValidMusicTrack);

  // 3. Merge: YT Music first, then YouTube — dedup by title key
  const seenIds = new Set(ytMusicResults.map(r => r.videoId));
  const seenTitles = new Set(ytMusicResults.map(r => normalizeTitleKey(r.title)));

  const merged = [...ytMusicResults];
  for (const video of mapped) {
    if (merged.length >= limit) break;
    if (seenIds.has(video.videoId)) continue;
    const titleKey = normalizeTitleKey(video.title);
    if (seenTitles.has(titleKey)) continue;
    seenIds.add(video.videoId);
    seenTitles.add(titleKey);
    merged.push(video);
  }

  return merged.slice(0, limit);
}

export async function getMetadata(videoId: string) {
  try {
    console.log(`[youtube.ts] Fetching metadata for: ${videoId}`);
    
    // Try youtubei.js first
    try {
      const yt = await getYouTube();
      console.log(`[youtube.ts] Innertube instance ready`);
      
      const info = await yt.getBasicInfo(videoId);
      console.log(`[youtube.ts] Got basic info from Innertube`);
      
      const title = info.basic_info.title || '';
      const thumbnail = info.basic_info.thumbnail?.[0]?.url || '';
      
      if (title && thumbnail) {
        const artist = info.basic_info.author || 'Unknown Artist';
        return {
          videoId,
          title,
          artist,
          duration: info.basic_info.duration || 0,
          thumbnail
        };
      }
    } catch (innertubeError: any) {
      console.warn(`[youtube.ts] Innertube failed, trying fallback:`, innertubeError.message);
    }
    
    // Fallback: Use YouTube oEmbed API (more reliable in serverless)
    console.log(`[youtube.ts] Using oEmbed fallback`);
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed API failed with status ${response.status}`);
    }
    
    const data = await response.json() as any;
    console.log(`[youtube.ts] Got oEmbed data:`, data);
    
    return {
      videoId,
      title: data.title || 'Unknown Title',
      artist: data.author_name || 'Unknown Artist',
      duration: 0, // oEmbed doesn't provide duration, but player will handle it
      thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  } catch (error: any) {
    console.error('[youtube.ts] All methods failed for video', videoId, '-', error.message);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}

export async function getRelatedTracks(videoId: string, limit?: number | null): Promise<VideoResult[]> {
  const yt = await getYouTube();
  const info: any = await (yt as any).getInfo(videoId);
  const hasLimit = typeof limit === 'number' && limit > 0;

  const relatedItems: any[] = info?.related_videos
    || info?.watch_next_feed?.items
    || [];

  const results: VideoResult[] = [];
  const seen = new Set<string>();
  const seenTitles = new Set<string>();
  const MIN_DURATION = 60;
  const MAX_DURATION = 900;

  const appendFromItems = (items: any[]) => {
    for (const item of items) {
      if (hasLimit && results.length >= limit) break;

      // ── ID extraction ────────────────────────────────────────────────────
      const id: string = item?.id || item?.video_id || '';
      if (!id || id === videoId || seen.has(id)) continue;

      // ── Duration filter ──────────────────────────────────────────────────
      const duration = item?.duration?.seconds || item?.length_seconds || 0;
      if (duration && (duration < MIN_DURATION || duration > MAX_DURATION)) continue;

      // ── Normalize through centralised pipeline ───────────────────────────
      // normalizeTrack handles ALL Innertube item shapes (WEB + WEB_REMIX),
      // including item.artists[] from YTM which was the root cause of the
      // Unknown Artist bug when the YTM fallback path was used.
      const normalized = normalizeTrack({ ...item, id });
      if (!normalized) continue;

      // ── Title-level dedup ────────────────────────────────────────────────
      const titleKey = normalizeTitleKey(normalized.title);
      if (!titleKey || seenTitles.has(titleKey)) continue;

      seen.add(id);
      seenTitles.add(titleKey);
      results.push(normalized);
    }
  };

  appendFromItems(relatedItems);

  if (!hasLimit || results.length < limit) {
    try {
      let feed = info?.watch_next_feed;
      if (typeof info?.getWatchNext === 'function') {
        feed = await info.getWatchNext();
      } else if (typeof info?.getNextContent === 'function') {
        feed = await info.getNextContent();
      } else if (typeof info?.getWatchNextContinuation === 'function') {
        feed = await info.getWatchNextContinuation();
      }

      let current = feed;
      const visitedContinuations = new Set<string>();
      while (current && (!hasLimit || results.length < limit)) {
        const beforeCount = results.length;
        const items = extractItemsFromSource(current);
        appendFromItems(items);

        if (!current?.has_continuation || typeof current.getContinuation !== 'function') break;
        if (results.length === beforeCount && !items.length) break;
        const continuationKey = current.continuation || current.continuation_token || current.endpoint?.payload?.continuation;
        if (continuationKey && visitedContinuations.has(continuationKey)) break;
        if (continuationKey) visitedContinuations.add(continuationKey);
        current = await current.getContinuation();
      }
    } catch (_) {
      // ignore watch-next continuation errors
    }
  }

  if (!hasLimit || results.length < limit) {
    try {
      const music = await getYouTubeMusic();
      const musicApi = (music as any).music || music;
      const candidates = [
        musicApi?.getNextContent,
        musicApi?.getWatchNext,
        musicApi?.getUpNext,
        musicApi?.getRadio
      ];

      for (const fn of candidates) {
        if (hasLimit && results.length >= limit) break;
        if (typeof fn !== 'function') continue;
        try {
          const res = await fn.call(musicApi, videoId);
          const items = extractItemsFromSource(res);
          appendFromItems(items);

          let current = res;
          const visitedContinuations = new Set<string>();
          while (current?.has_continuation && (!hasLimit || results.length < limit) && typeof current.getContinuation === 'function') {
            const beforeCount = results.length;
            const continuationKey = current.continuation || current.continuation_token || current.endpoint?.payload?.continuation;
            if (continuationKey && visitedContinuations.has(continuationKey)) break;
            if (continuationKey) visitedContinuations.add(continuationKey);
            current = await current.getContinuation();
            const moreItems = extractItemsFromSource(current);
            appendFromItems(moreItems);
            if (results.length === beforeCount && !moreItems.length) break;
          }
        } catch (_) {
          // ignore and try next candidate
        }
      }
    } catch (_) {
      // ignore music watch-next errors
    }
  }

  return results;
}

export async function searchMusic(query: string, type: MusicSearchType, limit: number = 20): Promise<MusicSearchResult[]> {
  const yt = await getYouTubeMusic();

  let ytType: string;
  if (type === 'playlists') ytType = 'playlist';
  else if (type === 'albums') ytType = 'album';
  else ytType = 'artist';

  const raw = await (yt as any).music.search(query, { type: ytType });
  const items: any[] = raw?.contents?.flatMap((section: any) => section?.contents || section?.items || []) 
    ?? raw?.items 
    ?? [];

  const results: MusicSearchResult[] = [];

  for (const item of items) {
    if (results.length >= limit) break;
    if (!item) continue;

    try {
      if (type === 'playlists') {
        const id: string = item.id || item.playlist_id || '';
        if (!id) continue;
        const playlistId = id.startsWith('VL') ? id.slice(2) : id;
        results.push({
          type: 'playlist',
          playlistId,
          title: item.title?.text || item.title || 'Unknown Playlist',
          author: item.author?.name || item.authors?.[0]?.name || item.subtitle?.text || 'Unknown',
          thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail),
          trackCount: item.item_count ? parseInt(item.item_count, 10) : undefined
        });
      } else if (type === 'albums') {
        const id: string = item.id || '';
        if (!id) continue;
        results.push({
          type: 'album',
          browseId: id,
          title: item.title?.text || item.title || 'Unknown Album',
          artist: item.author?.name || item.authors?.[0]?.name || item.subtitle?.text || 'Unknown',
          thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail),
          year: item.year || undefined
        });
      } else {
        const id: string = item.id || '';
        if (!id) continue;
        results.push({
          type: 'artist',
          browseId: id,
          name: item.name || item.title?.text || item.title || 'Unknown Artist',
          thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail),
          subscribers: item.subscribers?.text || undefined
        });
      }
    } catch (_) {
      // skip malformed items
    }
  }

  return results;
}

export async function getYTMusicPlaylistTracks(playlistId: string): Promise<VideoResult[]> {
  const yt = await getYouTubeMusic();
  // must use the music sub-client, not the base yt client
  const playlist = await (yt as any).music.getPlaylist(playlistId);

  // .items is a computed getter that flattens the playlist contents
  const rawItems: any[] = playlist?.items ?? [];

  const tracks: VideoResult[] = [];
  for (const item of rawItems) {
    const normalized = normalizeTrack(item);
    if (normalized) tracks.push(normalized);
  }

  return tracks;
}

export async function getYTMusicAlbumTracks(browseId: string): Promise<{ tracks: VideoResult[]; title: string; artist: string; thumbnail: string; year?: string }> {
  const yt = await getYouTubeMusic();
  const album = await (yt as any).music.getAlbum(browseId);

  const title: string = getText(album?.header?.title) || 'Unknown Album';

  // Extract artist from album header with extensive fallbacks
  const headerArtists = Array.isArray(album?.header?.artists)
    ? album.header.artists.map((a: any) => a?.name || getText(a)).filter((n: string) => n && n.toUpperCase() !== 'N/A').join(', ')
    : '';

  const albumArtist: string =
    (headerArtists && headerArtists.toUpperCase() !== 'N/A' ? headerArtists : '') ||
    getText(album?.header?.author?.name) ||
    album?.header?.author?.name ||
    getText(album?.header?.author) ||
    getText(album?.header?.strapline_text_one) ||
    getText(album?.header?.artists?.[0]?.name) ||
    album?.header?.artists?.[0]?.name ||
    cleanArtistName(getText(album?.header?.subtitle)?.split(/[•·]/)?.[0]?.trim() || '') ||
    'Unknown Artist';

  const artist = albumArtist.toUpperCase() === 'N/A' ? 'Unknown Artist' : albumArtist;
  const thumbnail: string = getThumbnailUrl(album?.header?.thumbnail?.contents || album?.header?.thumbnail);
  // year lives inside subtitle text e.g. "EP • 2005"
  const subtitleText: string = getText(album?.header?.subtitle) || '';
  const yearMatch = subtitleText.match(/\b(19|20)\d{2}\b/);
  const year: string | undefined = yearMatch ? yearMatch[0] : undefined;

  // album.contents is the direct flat array of MusicResponsiveListItem tracks
  const rawItems: any[] = album?.contents ?? [];

  const tracks: VideoResult[] = [];
  for (const item of rawItems) {
    // Explicitly check track artists vs albumArtist
    let trackArtist = '';
    if (Array.isArray(item.artists) && item.artists.length > 0) {
      const names = item.artists
        .map((a: any) => a?.name || getText(a))
        .filter((n: string) => n && typeof n === 'string' && n.trim() && n.toUpperCase() !== 'N/A');
      if (names.length > 0) {
        trackArtist = cleanArtistName(names.join(', '));
      }
    }

    // Fall back to album's artist if track has none or says N/A
    const fallbackArtist = trackArtist || artist;

    const normalized = normalizeTrack(item, { artist: fallbackArtist, thumbnail });
    if (normalized) {
      if (!normalized.artist || normalized.artist.toUpperCase() === 'N/A' || normalized.artist.toLowerCase() === 'unknown artist') {
        normalized.artist = artist;
      }
      tracks.push(normalized);
    }
  }

  return { tracks, title, artist, thumbnail, year };
}

export async function getYTMusicArtistTopTracks(browseId: string): Promise<{ tracks: VideoResult[]; name: string; thumbnail: string; subscribers?: string }> {
  const yt = await getYouTubeMusic();
  const artist = await (yt as any).music.getArtist(browseId);

  const name: string = getText(artist?.header?.title) || 'Unknown Artist';
  const thumbnail: string = getThumbnailUrl(artist?.header?.thumbnail?.contents || artist?.header?.thumbnail);
  const subscribers: string | undefined = artist?.header?.subscribers?.text || undefined;

  // ── Try getAllSongs() first — returns the full songs shelf ─────────────
  try {
    const shelf = await artist.getAllSongs();
    if (shelf?.contents?.length) {
      const tracks: VideoResult[] = [];
      const seen = new Set<string>();

      const addItems = (items: any[]) => {
        for (const item of items) {
          if (!item || !(item as any).id) continue;           // skip ContinuationItem
          const normalized = normalizeTrack(item, { artist: name, thumbnail });
          if (normalized && !seen.has(normalized.videoId)) {
            seen.add(normalized.videoId);
            tracks.push(normalized);
          }
        }
      };

      addItems(shelf.contents);

      // Paginate through continuations up to a safe limit (200 tracks or 8 pages) to prevent Vercel serverless function timeouts
      let currentShelf = shelf;
      const MAX_TRACKS = 200;
      let pageCount = 0;
      while (currentShelf?.has_continuation && tracks.length < MAX_TRACKS && pageCount < 8) {
        try {
          pageCount++;
          currentShelf = await currentShelf.getContinuation();
          const moreContents = currentShelf?.contents || [];
          if (!moreContents.length) break;
          addItems(moreContents);
        } catch (paginationError) {
          console.warn('[youtube.ts] Pagination error, stopping:', paginationError);
          break;
        }
      }

      if (tracks.length > 0) {
        console.log(`[youtube.ts] Fetched ${tracks.length} tracks for artist ${name}`);
        return { tracks, name, thumbnail, subscribers };
      }
    }
  } catch (_) {
    // fall through to top-tracks fallback below
  }

  // ── Fallback: parse the "Top songs" shelf from the artist page ─────────
  const songsSection = artist?.sections?.find((s: any) => {
    const t = getText(s?.title).toLowerCase();
    return t.includes('song') || s?.contents?.[0]?.id;
  }) || artist?.sections?.[0];
  const rawItems: any[] = songsSection?.contents ?? [];

  const tracks: VideoResult[] = [];
  for (const item of rawItems) {
    const normalized = normalizeTrack(item, { artist: name, thumbnail });
    if (normalized) tracks.push(normalized);
  }

  return { tracks, name, thumbnail, subscribers };
}
