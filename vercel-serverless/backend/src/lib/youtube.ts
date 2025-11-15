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

export async function search(query: string): Promise<VideoResult[]> {
  const yt = await getYouTube();
  const results = await yt.search(query, { type: 'video' });
  
  return results.videos.slice(0, 10).map((video: any) => ({
    videoId: video.id,
    title: video.title.text || '',
    artist: video.author?.name || 'Unknown',
    duration: video.duration?.seconds || 0,
    thumbnail: video.best_thumbnail?.url || ''
  }));
}

export async function getMetadata(videoId: string) {
  const yt = await getYouTube();
  const info = await yt.getBasicInfo(videoId);
  
  return {
    videoId,
    title: info.basic_info.title || '',
    artist: info.basic_info.author || 'Unknown',
    duration: info.basic_info.duration || 0,
    thumbnail: info.basic_info.thumbnail?.[0]?.url || ''
  };
}
