import { create } from 'zustand';
import { cache, Track } from '../lib/cache';

// Use environment variable for API URL, fallback to /api for development proxy
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioStream {
  url: string;
  source: string;
  bitrate?: number;
}

// YouTube IFrame Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerStore {
  // State
  state: PlayerState;
  currentTrack: Track | null;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
  error: string | null;
  
  // Audio element (managed internally)
  audio: HTMLAudioElement | null;
  ytPlayer: any; // YouTube IFrame player instance
  
  // Actions
  search: (query: string) => Promise<Track[]>;
  play: (track: Track) => Promise<void>;
  togglePlay: () => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  clearQueue: () => Promise<void>;
  like: (track: Track) => Promise<void>;
  unlike: (videoId: string) => Promise<void>;
  isLiked: (videoId: string) => boolean;
  init: () => Promise<void>;
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  state: 'idle',
  currentTrack: null,
  queue: [],
  volume: 0.7,
  progress: 0,
  duration: 0,
  error: null,
  audio: null,
  ytPlayer: null,

  init: async () => {
    await cache.init();
    const cached = cache.getCache();
    
    // Create audio element
    const audio = new Audio();
    audio.volume = 0.7;
    
    // Audio event listeners
    audio.addEventListener('timeupdate', () => {
      set({ progress: audio.currentTime, duration: audio.duration || 0 });
    });
    
    audio.addEventListener('ended', () => {
      get().next();
    });
    
    audio.addEventListener('playing', () => {
      set({ state: 'playing', error: null });
    });
    
    audio.addEventListener('pause', () => {
      const store = get();
      if (store.state !== 'loading') {
        set({ state: 'paused' });
      }
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      set({ state: 'error', error: 'Failed to load audio' });
    });

    set({ 
      audio,
      queue: cached.queue,
      currentTrack: cached.lastPlayed,
    });
  },

  search: async (query: string) => {
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search');
    }
  },

  play: async (track: Track) => {
    const { audio, ytPlayer } = get();
    if (!audio) return;

    // IMMEDIATELY terminate any current stream
    console.log('🛑 Terminating current stream...');
    
    // Stop and clear audio element
    if (audio.src) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load(); // Force clear the buffer
    }
    
    // Destroy YouTube player if exists
    if (ytPlayer) {
      try {
        const interval = (ytPlayer as any).progressInterval;
        if (interval) clearInterval(interval);
        ytPlayer.stopVideo();
        ytPlayer.destroy();
      } catch (e) {
        console.warn('Error destroying YT player:', e);
      }
      set({ ytPlayer: null });
    }

    // Immediately set the current track and state
    set({ 
      state: 'loading', 
      currentTrack: track, 
      error: null,
      progress: 0,
      // Set duration from track metadata
      duration: track.duration || 0
    });

    console.log('🎵 Playing track:', track.title, 'by', track.artist);

    // Remove the track from queue if it exists
    const { queue } = get();
    const trackIndex = queue.findIndex(t => t.videoId === track.videoId);
    if (trackIndex !== -1) {
      const newQueue = queue.filter((_, i) => i !== trackIndex);
      set({ queue: newQueue });
      await cache.removeFromQueue(trackIndex);
      console.log('🗑️ Removed from queue:', track.title);
    }

    try {
      // Get stream URL
      const response = await fetch(`${API_BASE}/track/${track.videoId}/stream`);
      
      if (!response.ok) {
        throw new Error(`Stream fetch failed: ${response.status}`);
      }
      
      const stream: AudioStream = await response.json();
      
      console.log('🔊 Stream source:', stream.source);

      // Handle iframe source - create a hidden iframe for audio playback
      if (stream.source === 'iframe') {
        console.log('📺 Using iframe fallback (will stick to this method for session)');
        
        // For iframe, we'll use the YouTube IFrame API
        // Create a container for the iframe if it doesn't exist
        let iframeContainer = document.getElementById('yt-player-container');
        if (!iframeContainer) {
          iframeContainer = document.createElement('div');
          iframeContainer.id = 'yt-player-container';
          iframeContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
          document.body.appendChild(iframeContainer);
        }
        
        // Load YouTube IFrame API if not loaded
        if (!(window as any).YT) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
          
          // Wait for API to load
          await new Promise((resolve) => {
            (window as any).onYouTubeIframeAPIReady = resolve;
          });
        }
        
        // Clean up existing player
        const oldPlayer = get().ytPlayer;
        if (oldPlayer) {
          try {
            const interval = (oldPlayer as any).progressInterval;
            if (interval) clearInterval(interval);
            oldPlayer.destroy();
          } catch (e) {
            console.warn('Error destroying old YT player:', e);
          }
        }
        
        // Create YouTube player
        const player = new (window as any).YT.Player(iframeContainer, {
          height: '1',
          width: '1',
          videoId: track.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
          },
          events: {
            onReady: () => {
              set({ 
                state: 'playing',
                duration: player.getDuration(),
                ytPlayer: player 
              });
              
              // Set volume
              player.setVolume(get().volume * 100);
              
              // Start progress tracking
              const interval = setInterval(() => {
                if (player && player.getPlayerState) {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  set({ progress: currentTime, duration });
                }
              }, 100);
              
              // Store interval for cleanup
              (player as any).progressInterval = interval;
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                set({ state: 'playing' });
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                set({ state: 'paused' });
              } else if (event.data === (window as any).YT.PlayerState.ENDED) {
                // Clear progress interval
                const interval = (player as any).progressInterval;
                if (interval) clearInterval(interval);
                get().next();
              }
            },
          },
        });
        
        // Update cache
        await cache.setLastPlayed(track);
        return;
      }

      // Regular audio stream
      audio.src = stream.url;
      await audio.play();

      // Update cache
      await cache.setLastPlayed(track);

    } catch (error) {
      console.error('Play error:', error);
      set({ state: 'error', error: 'Failed to play track. Trying next...' });
      
      // Auto-try next track on error
      setTimeout(() => {
        get().next();
      }, 2000);
    }
  },

  togglePlay: () => {
    const { audio, state, currentTrack } = get();
    const ytPlayer = (get() as any).ytPlayer;
    
    if (!currentTrack) return;

    if (state === 'playing') {
      if (ytPlayer) {
        ytPlayer.pauseVideo();
      } else if (audio) {
        audio.pause();
      }
    } else {
      // Check if we have an active stream source
      const hasActiveStream = (audio && audio.src) || ytPlayer;
      
      if (!hasActiveStream) {
        // No active stream - need to reload the track
        console.log('🔄 No active stream found, reloading track...');
        get().play(currentTrack);
        return;
      }
      
      // Resume playback
      if (ytPlayer) {
        ytPlayer.playVideo();
      } else if (audio) {
        audio.play();
      }
    }
  },

  next: async () => {
    const { queue, audio, ytPlayer } = get();
    // Simply play the first song in queue (since current song was already removed)
    if (queue.length > 0) {
      await get().play(queue[0]);
    } else {
      // Queue is empty, stop and clean up playback
      console.log('📭 Queue empty, stopping playback');
      
      // Clean up audio
      if (audio && audio.src) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
      }
      
      // Clean up YouTube player
      if (ytPlayer) {
        try {
          const interval = (ytPlayer as any).progressInterval;
          if (interval) clearInterval(interval);
          ytPlayer.stopVideo();
          ytPlayer.destroy();
        } catch (e) {
          console.warn('Error destroying YT player:', e);
        }
      }
      
      set({ 
        state: 'idle', 
        currentTrack: null, 
        progress: 0, 
        duration: 0,
        ytPlayer: null
      });
    }
  },

  prev: async () => {
    const { progress, audio } = get();
    
    // If more than 3 seconds in, restart current track
    if (progress > 3) {
      get().seek(0);
      return;
    }

    // Previous functionality removed since queue is now FIFO and current track is removed
    // Just restart the current track if less than 3 seconds
    get().seek(0);
  },

  seek: (seconds: number) => {
    const { audio } = get();
    const ytPlayer = (get() as any).ytPlayer;
    
    if (ytPlayer) {
      ytPlayer.seekTo(seconds, true);
    } else if (audio) {
      audio.currentTime = seconds;
    }
  },

  setVolume: (volume: number) => {
    const { audio, ytPlayer } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (ytPlayer) {
      ytPlayer.setVolume(clampedVolume * 100); // YouTube API uses 0-100
    } else if (audio) {
      audio.volume = clampedVolume;
    }
    set({ volume: clampedVolume });
  },

  addToQueue: async (track: Track) => {
    const { queue } = get();
    const newQueue = [...queue, track];
    set({ queue: newQueue });
    await cache.addToQueue(track);
  },

  removeFromQueue: async (index: number) => {
    const { queue } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    set({ queue: newQueue });
    await cache.removeFromQueue(index);
  },

  clearQueue: async () => {
    set({ queue: [] });
    await cache.clearQueue();
  },

  like: async (track: Track) => {
    await cache.likeSong(track);
  },

  unlike: async (videoId: string) => {
    await cache.unlikeSong(videoId);
  },

  isLiked: (videoId: string) => {
    return cache.isLiked(videoId);
  },
}));
