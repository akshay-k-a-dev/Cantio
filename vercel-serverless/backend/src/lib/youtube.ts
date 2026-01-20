import Innertube from 'youtubei.js';

let youtube: Innertube | null = null;

async function getYouTube() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

export interface VideoResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
}

export async function search(query: string, limit: number = 10): Promise<VideoResult[]> {
  const yt = await getYouTube();
  
  const results = await yt.search(query, { type: 'video' });
  
  // Filter duration: 1 min (60s) to 10 min (600s)
  const MIN_DURATION = 60;   // 1 minute
  const MAX_DURATION = 600;  // 10 minutes
  
  const videos = results.videos
    .filter((video: any) => video && video.id && video.title)
    .map((video: any) => ({
      videoId: video.id,
      title: video.title?.text || video.title || 'Unknown Title',
      artist: video.author?.name || 'Unknown',
      duration: video.duration?.seconds || 0,
      thumbnail: video.best_thumbnail?.url || ''
    }))
    .filter((video) => video.duration >= MIN_DURATION && video.duration <= MAX_DURATION)
    .slice(0, limit);
  
  return videos;
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
        return {
          videoId,
          title,
          artist: info.basic_info.author || 'Unknown',
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
    
    const data = await response.json();
    console.log(`[youtube.ts] Got oEmbed data:`, data);
    
    return {
      videoId,
      title: data.title || 'Unknown Title',
      artist: data.author_name || 'Unknown Artist',
      duration: 0, // oEmbed doesn't provide duration, but player will handle it
      thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  } catch (error: any) {
    console.error(`[youtube.ts] All methods failed for ${videoId}:`, error.message);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}
