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
  const yt = await getYouTube();
  const info = await yt.getBasicInfo(videoId);
  
  const title = info.basic_info.title || '';
  const thumbnail = info.basic_info.thumbnail?.[0]?.url || '';
  
  // Validate that we got actual data
  if (!title || !thumbnail) {
    throw new Error(`Failed to fetch metadata for video ${videoId}: Missing title or thumbnail`);
  }
  
  return {
    videoId,
    title,
    artist: info.basic_info.author || 'Unknown',
    duration: info.basic_info.duration || 0,
    thumbnail
  };
}
