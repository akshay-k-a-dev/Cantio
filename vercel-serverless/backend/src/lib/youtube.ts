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

export async function search(query: string, limit: number = 10): Promise<VideoResult[]> {
  const yt = await getYouTube();
  
  // Apply Music category filter
  const results = await yt.search(query, { type: 'video' });
  
  // Blacklist keywords to filter out non-song content
  const blacklist = [
    'interview',
    'podcast',
    'reaction',
    'review',
    'analysis',
    'trailer',
    'teaser',
    'explanation',
    'news',
    "case",
    "arrest",
    "arrested",
    "mla",
    "court",
    "crime",
    "police",
    "exclusive",
    "reporter",
    "debate",
    "breaking",
    "politics",
    "geopolitics",
    "documentary",
    "vlog",
    "comedy",
    "sketch",
    "prank",
    "challenge",
    "gaming",
    "walkthrough",
    "speedrun",
    "mod showcase",
    "gameplay",
    "stream highlights" ,
    "tv"    
  ];
  
  // Filter duration: 1 min (60s) to 10 min (600s)
  const MIN_DURATION = 60;   // 1 minute
  const MAX_DURATION = 600;  // 10 minutes
  
  const mapped: VideoResult[] = results.videos
    .filter((video: any) => video && video.id && video.title)
    .map((video: any): VideoResult => ({
      videoId: video.id,
      title: video.title?.text || video.title || 'Unknown Title',
      artist: video.author?.name || 'Unknown',
      duration: video.duration?.seconds || 0,
      thumbnail: video.best_thumbnail?.url || ''
    }));

  const videos = mapped
    .filter((video) => video.duration >= MIN_DURATION && video.duration <= MAX_DURATION)
    .filter((video) => {
      // Remove videos with blacklist keywords in title or channel name
      const titleLower = video.title.toLowerCase();
      const artistLower = video.artist.toLowerCase();
      return !blacklist.some(keyword => 
        titleLower.includes(keyword) || artistLower.includes(keyword)
      );
    });
  
  // Prioritize Topic channels (e.g., "Artist - Topic")
  const topicVideos = videos.filter(video => video.artist.includes('- Topic'));
  const otherVideos = videos.filter(video => !video.artist.includes('- Topic'));
  
  // Return Topic videos first, then others
  const sortedVideos = [...topicVideos, ...otherVideos].slice(0, limit);
  
  return sortedVideos;
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
    console.error(`[youtube.ts] All methods failed for ${videoId}:`, error.message);
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}

function getThumbnailUrl(thumbnails: any): string {
  if (!thumbnails) return '';
  if (Array.isArray(thumbnails)) {
    return thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || '';
  }
  if (thumbnails.url) return thumbnails.url;
  return '';
}

/** Safely extract a plain string from a youtubei.js Text / string value */
function getText(t: any): string {
  if (!t) return '';
  if (typeof t === 'string') return t;
  if (t.text && typeof t.text === 'string') return t.text;
  if (Array.isArray(t.runs)) return t.runs.map((r: any) => r?.text || '').join('');
  const s = String(t);
  return s === '[object Object]' ? '' : s;
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
    if (!item) continue;
    const videoId: string = item.id || '';
    if (!videoId) continue;
    const title = getText(item.title);
    if (!title) continue;
    tracks.push({
      videoId,
      title,
      artist: item.artists?.[0]?.name || item.author?.name || 'Unknown',
      duration: item.duration?.seconds || 0,
      thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail)
        || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    });
  }

  return tracks;
}

export async function getYTMusicAlbumTracks(browseId: string): Promise<{ tracks: VideoResult[]; title: string; artist: string; thumbnail: string; year?: string }> {
  const yt = await getYouTubeMusic();
  const album = await (yt as any).music.getAlbum(browseId);

  const title: string = getText(album?.header?.title) || 'Unknown Album';
  // strapline_text_one holds the artist name; subtitle is "EP • Year"
  const artist: string = getText(album?.header?.strapline_text_one) || 'Unknown Artist';
  const thumbnail: string = getThumbnailUrl(album?.header?.thumbnail?.contents || album?.header?.thumbnail);
  // year lives inside subtitle text e.g. "EP • 2005"
  const subtitleText: string = getText(album?.header?.subtitle) || '';
  const yearMatch = subtitleText.match(/\b(19|20)\d{2}\b/);
  const year: string | undefined = yearMatch ? yearMatch[0] : undefined;

  // album.contents is the direct flat array of MusicResponsiveListItem tracks
  const rawItems: any[] = album?.contents ?? [];

  const tracks: VideoResult[] = [];
  for (const item of rawItems) {
    if (!item) continue;
    const videoId: string = item.id || '';
    if (!videoId) continue;
    const trackTitle = getText(item.title);
    if (!trackTitle) continue;
    tracks.push({
      videoId,
      title: trackTitle,
      artist: item.artists?.[0]?.name || item.author?.name || artist,
      duration: item.duration?.seconds || 0,
      thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail)
        || thumbnail
        || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    });
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
      for (const item of shelf.contents) {
        if (!item || !(item as any).id) continue;           // skip ContinuationItem
        const videoId: string = (item as any).id;
        const trackTitle = getText((item as any).title);
        if (!trackTitle) continue;
        tracks.push({
          videoId,
          title: trackTitle,
          artist: (item as any).artists?.[0]?.name || (item as any).author?.name || name,
          duration: (item as any).duration?.seconds || 0,
          thumbnail: getThumbnailUrl((item as any).thumbnail?.contents || (item as any).thumbnail)
            || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
      }
      if (tracks.length > 0) {
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
    if (!item) continue;
    const videoId: string = item.id || '';
    if (!videoId) continue;
    const trackTitle = getText(item.title);
    if (!trackTitle) continue;
    tracks.push({
      videoId,
      title: trackTitle,
      artist: item.artists?.[0]?.name || item.author?.name || name,
      duration: item.duration?.seconds || 0,
      thumbnail: getThumbnailUrl(item.thumbnail?.contents || item.thumbnail)
        || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    });
  }

  return { tracks, name, thumbnail, subscribers };
}
