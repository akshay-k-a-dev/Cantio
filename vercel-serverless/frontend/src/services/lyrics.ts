// Use backend proxy to bypass CORS
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

// Import cache for lyrics caching
import { cache } from '../lib/cache';

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
 * Get lyrics from LRCLIB API using search endpoint
 * Checks IndexedDB cache first to reduce API calls
 */
export async function getLyrics(
  trackName: string,
  artistName: string,
  duration: number
): Promise<LyricsData | null> {
  try {
    // Check cache first
    const cached = await cache.getLyrics(trackName, artistName);
    if (cached) {
      console.log('📝 Lyrics: Cache hit for', trackName);
      return cached;
    }

    console.log('📝 Lyrics: Cache miss, fetching from backend for', trackName);

    // Use backend proxy to bypass CORS
    const searchParams = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });

    const response = await fetch(`${API_BASE}/lyrics?${searchParams.toString()}`);
    
    if (!response.ok) {
      console.error('Lyrics search failed:', response.status);
      return null;
    }

    const results: LyricsData[] = await response.json();
    
    if (!results || results.length === 0) {
      return null;
    }

    // Find best match by duration (within 5 seconds)
    const targetDuration = Math.round(duration);
    const bestMatch = results.find((r) => 
      Math.abs(r.duration - targetDuration) <= 5
    ) || results[0];
    
    // Cache the result for future use
    if (bestMatch) {
      await cache.setLyrics(trackName, artistName, bestMatch);
      console.log('📝 Lyrics: Cached for', trackName);
    }
    
    return bestMatch;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
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
