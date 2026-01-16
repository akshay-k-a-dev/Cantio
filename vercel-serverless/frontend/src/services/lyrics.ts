// Use backend proxy to bypass CORS
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

export interface LyricsData {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface SyncedLine {
  time: number;
  text: string;
}

/**
 * Parse synced lyrics format [mm:ss.xx] text
 */
export function parseSyncedLyrics(syncedLyrics: string): SyncedLine[] {
  const lines = syncedLyrics.split('\n').filter(line => line.trim());
  const parsed: SyncedLine[] = [];

  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+)\.(\d+)\]\s*(.*)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = match[4];
      parsed.push({ time, text });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Extract potential song name and artist from YouTube title
 * YouTube titles often have formats like:
 * - "Artist - Song Name"
 * - "Song Name - Artist"
 * - "Artist - Song Name (Official Video)"
 * - "Song Name ft. Artist2 - Artist1"
 */
function extractTitleCombinations(title: string): { track: string; artist: string }[] {
  const combinations: { track: string; artist: string }[] = [];
  
  // Clean the title - remove common suffixes
  let cleanTitle = title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\(Audio.*?\)/gi, '')
    .replace(/\(Lyric.*?\)/gi, '')
    .replace(/\(Music.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\[Audio.*?\]/gi, '')
    .replace(/\[Lyric.*?\]/gi, '')
    .replace(/Official Video/gi, '')
    .replace(/Official Audio/gi, '')
    .replace(/Lyrics/gi, '')
    .replace(/HD|HQ|4K/gi, '')
    .replace(/ft\.|feat\./gi, 'ft')
    .trim();
  
  // Try splitting by " - "
  if (cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ').map(p => p.trim());
    if (parts.length >= 2) {
      // Artist - Song
      combinations.push({ track: parts[1], artist: parts[0] });
      // Song - Artist
      combinations.push({ track: parts[0], artist: parts[1] });
    }
  }
  
  // Try splitting by " | "
  if (cleanTitle.includes(' | ')) {
    const parts = cleanTitle.split(' | ').map(p => p.trim());
    if (parts.length >= 2) {
      combinations.push({ track: parts[0], artist: parts[1] });
      combinations.push({ track: parts[1], artist: parts[0] });
    }
  }
  
  // Just use the clean title as track name
  combinations.push({ track: cleanTitle, artist: '' });
  
  return combinations;
}

/**
 * Get lyrics from LRCLIB API using search endpoint
 * Retries with different title/artist combinations if initial search fails
 */
export async function getLyrics(
  trackName: string,
  artistName: string,
  duration: number
): Promise<LyricsData | null> {
  const targetDuration = Math.round(duration);
  
  // Helper to search and find best match
  async function searchLyricsApi(track: string, artist: string): Promise<LyricsData | null> {
    try {
      const searchParams = new URLSearchParams({
        track_name: track,
        artist_name: artist,
      });

      const response = await fetch(`${API_BASE}/lyrics?${searchParams.toString()}`);
      
      if (!response.ok) return null;

      const results: LyricsData[] = await response.json();
      
      if (!results || results.length === 0) return null;

      // Find best match by duration (within 10 seconds for more flexibility)
      const bestMatch = results.find((r) => 
        Math.abs(r.duration - targetDuration) <= 10
      ) || results[0];
      
      // Only return if it has lyrics
      if (bestMatch && (bestMatch.syncedLyrics || bestMatch.plainLyrics)) {
        return bestMatch;
      }
      return null;
    } catch {
      return null;
    }
  }
  
  // Try 1: Original artist + track name
  let result = await searchLyricsApi(trackName, artistName);
  if (result) return result;
  
  // Try 2: Use combinations extracted from the title
  const combinations = extractTitleCombinations(trackName);
  for (const combo of combinations) {
    result = await searchLyricsApi(combo.track, combo.artist || artistName);
    if (result) return result;
  }
  
  // Try 3: Just the track name without artist
  result = await searchLyricsApi(trackName, '');
  if (result) return result;
  
  return null;
}

/**
 * Search for lyrics by query string
 */
export async function searchLyrics(query: string): Promise<LyricsData[]> {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_BASE}/lyrics?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search lyrics: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching lyrics:', error);
    return [];
  }
}

/**
 * Get current line index based on playback time
 */
export function getCurrentLineIndex(lines: SyncedLine[], currentTime: number): number {
  if (lines.length === 0) return -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      return i;
    }
  }

  return -1;
}

/**
 * Fun messages when lyrics are not available
 */
export const noLyricsMessages = [
  "🎤 You caught us! We don't have lyrics for this one.",
  "🎵 Time to guess the lyrics yourself!",
  "🎶 This one's a mystery - no lyrics here!",
  "🎸 La la la... (we don't have the lyrics)",
  "🎹 Instrumental vibes only (or we just don't have it)",
  "🎧 No lyrics? More room for imagination!",
  "🎼 The lyrics are playing hide and seek!",
  "🎪 Sing whatever you want - no lyrics to judge you!",
];

export const noSyncedLyricsMessage = "⏱️ Hmm, this song doesn't have synced lyrics yet, but here's the plain text!";

export function getRandomNoLyricsMessage(): string {
  return noLyricsMessages[Math.floor(Math.random() * noLyricsMessages.length)];
}
