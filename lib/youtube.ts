import { Innertube } from 'youtubei.js';

export interface TrackMetadata {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}

export interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}

// Cache for Innertube instance (serverless functions reuse this)
let innertubeInstance: Innertube | null = null;

async function getInnertubeInstance(): Promise<Innertube> {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false, // Web client mode - no player needed
    });
  }
  return innertubeInstance;
}

// Helper function to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, ms: number, name: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${name} timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Get track metadata using Innertube (web client mode)
 */
export async function getMetadata(videoId: string): Promise<TrackMetadata> {
  try {
    const yt = await getInnertubeInstance();
    const infoPromise = yt.getInfo(videoId);
    const info = await withTimeout(infoPromise, 8000, 'Metadata fetch');
    
    const details = info.basic_info;
    
    return {
      videoId,
      title: details.title || 'Unknown Title',
      artist: details.author || 'Unknown Artist',
      duration: details.duration || 0,
      thumbnail: details.thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    // Return basic metadata if fetch fails
    return {
      videoId,
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      duration: 0,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
}

/**
 * Search for videos
 */
export async function search(query: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    const yt = await getInnertubeInstance();
    
    const searchPromise = yt.search(query, {
      type: 'video',
    });
    
    const results = await withTimeout(searchPromise, 15000, 'Search');

    const videos = results.videos || [];
    
    return videos.slice(0, limit).map((video: any) => ({
      videoId: video.id,
      title: video.title?.text || video.title || 'Unknown Title',
      artist: video.author?.name || 'Unknown Artist',
      duration: video.duration?.seconds || 0,
      thumbnail: video.thumbnails?.[0]?.url || video.best_thumbnail?.url || '',
    }));
  } catch (error) {
    console.error('Search failed:', error);
    // Return empty array instead of throwing to prevent 500 errors
    return [];
  }
}
