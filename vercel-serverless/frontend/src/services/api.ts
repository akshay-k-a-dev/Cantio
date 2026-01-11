import { useAuth } from '../lib/authStore';
import { Track } from '../lib/cache';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

export interface LikedTrack {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  likedAt: string;
}

export interface PlayHistory {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  playedAt: string;
}

// Get auth token from store
const getToken = () => {
  return useAuth.getState().token;
};

// Fetch with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============= LIKES API =============

export async function getLikedTracks(): Promise<LikedTrack[]> {
  const data = await fetchWithAuth('/likes');
  return data.likedTracks || [];
}

export async function likeTrack(track: Track): Promise<void> {
  await fetchWithAuth('/likes', {
    method: 'POST',
    body: JSON.stringify({
      trackId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration,
    }),
  });
}

export async function unlikeTrack(trackId: string): Promise<void> {
  await fetchWithAuth(`/likes/${trackId}`, {
    method: 'DELETE',
  });
}

export async function isTrackLiked(trackId: string): Promise<boolean> {
  const data = await fetchWithAuth(`/likes/${trackId}`);
  return data.isLiked || false;
}

// ============= HISTORY API =============

export async function getPlayHistory(limit = 50, offset = 0): Promise<PlayHistory[]> {
  const data = await fetchWithAuth(`/history?limit=${limit}&offset=${offset}`);
  return data.history || [];
}

export async function recordPlay(track: Track): Promise<void> {
  await fetchWithAuth('/history', {
    method: 'POST',
    body: JSON.stringify({
      trackId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration,
    }),
  });
}

// ============= SYNC API =============

export interface SyncStats {
  likesSynced: number;
  historySynced: number;
  duplicatesSkipped: number;
}

export async function syncLocalDataToCloud(
  likes: Track[],
  history: Track[]
): Promise<SyncStats> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ likes, history }),
  });

  if (!response.ok) {
    throw new Error('Sync failed');
  }

  return response.json();
}
