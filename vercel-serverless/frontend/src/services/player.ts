import { create } from 'zustand';
import { cache, Track } from '../lib/cache';
import { mediaSessionManager } from '../lib/mediaSession';
import { useQueue } from '../lib/queueStore';

// Determine API base URL dynamically
const getApiBase = () => {
  // In production, use VITE_API_URL from .env.production
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  
  // In development, use proxy
  return '/api';
};

const API_BASE = getApiBase();

// Player state flags
let nextTransitionInProgress = false;
let nextTransitionReleaseTimer: number | null = null;
let playerStoreInitialized = false;
let playerStoreInitPromise: Promise<void> | null = null;
let playerInstanceInitialized = false;

const isStandalonePwa = () => {
  if (typeof window === 'undefined') return false;
  const navStandalone = (window.navigator as any).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || navStandalone;
};

// Visibility logging for diagnosing background playback behavior
document.addEventListener('visibilitychange', () => {
  console.log('[PWA] visibilitychange:', document.visibilityState);
});

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type PlaybackMode = 'iframe'; // Only iframe mode now

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
  mode: PlaybackMode;
  currentTrack: Track | null;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
  error: string | null;
  isPlayerVisible: boolean;
  
  // YouTube IFrame player instance
  ytPlayer: any | null;
  ytPlayerReady: boolean;
  
  // Actions
  search: (query: string, limit?: number) => Promise<Track[]>;
  searchMusic: (query: string, type: 'playlists' | 'albums' | 'artists', limit?: number) => Promise<any[]>;
  getYTMusicPlaylistTracks: (playlistId: string) => Promise<Track[]>;
  getYTMusicAlbumTracks: (browseId: string) => Promise<{ tracks: Track[]; title: string; artist: string; thumbnail: string; year?: string }>;
  getYTMusicArtistTopTracks: (browseId: string) => Promise<{ tracks: Track[]; name: string; thumbnail: string; subscribers?: string }>;
  play: (track: Track) => Promise<void>;
  _playInternal: (track: Track, skipReverseQueue?: boolean) => Promise<void>;
  togglePlay: () => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  rearrangeQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => Promise<void>;
  like: (track: Track) => Promise<void>;
  unlike: (videoId: string) => Promise<void>;
  isLiked: (videoId: string) => boolean;
  checkIsLiked: (videoId: string) => Promise<boolean>;
  syncLikesFromDatabase: () => Promise<void>;
  syncFromDatabase: () => Promise<void>;
  init: () => Promise<void>;
  initYouTubePlayer: () => Promise<void>;
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  state: 'idle',
  mode: 'iframe',
  currentTrack: null,
  queue: [],
  volume: 1.0, // Increased from 0.7 to 1.0 (100%)
  progress: 0,
  duration: 0,
  error: null,
  isPlayerVisible: false,
  ytPlayer: null,
  ytPlayerReady: false,

  init: async () => {
    if (playerStoreInitialized) {
      console.log('[PWA] Player store already initialized, skipping init');
      return;
    }
    if (playerStoreInitPromise) {
      await playerStoreInitPromise;
      return;
    }

    playerStoreInitPromise = (async () => {
    await cache.init();
    
    // Now load from local cache first (for fast startup)
    const cached = cache.getCache();
    
    // Restore queue and last played song, but don't auto-play
    set({ 
      queue: cached.queue,
      currentTrack: cached.lastPlayed,
      state: 'idle', // Keep it idle, don't auto-play
    });

    // Initialize YouTube IFrame API first (critical for playback)
    await get().initYouTubePlayer();
    
    // For logged-in users: Sync from database in background (non-blocking)
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (token) {
      console.log('🔄 Logged in: Starting background sync from database...');
      // Fire and forget - don't block player initialization
      get().syncFromDatabase().catch(err => {
        console.error('Background sync failed:', err);
      });
    }
    
    // Register media session handlers for background playback
    if (isStandalonePwa()) {
      mediaSessionManager.setHandlers({
        play: () => {
          if (get().state !== 'playing') {
            get().togglePlay();
          }
        },
        pause: () => {
          if (get().state === 'playing') {
            get().togglePlay();
          }
        },
      });
    } else {
      mediaSessionManager.setHandlers({
        play: () => {
          if (get().state !== 'playing') {
            get().togglePlay();
          }
        },
        pause: () => {
          if (get().state === 'playing') {
            get().togglePlay();
          }
        },
        nextTrack: () => get().next(),
        previousTrack: () => get().prev(),
        stop: () => {
          if (get().state === 'playing') {
            get().togglePlay();
          }
          mediaSessionManager.updatePlaybackState('paused');
        },
        seekBackward: (details) => {
          const { progress } = get();
          const localOffset = typeof details?.seekOffset === 'number' ? details.seekOffset : 10;
          get().seek(Math.max(0, progress - localOffset));
        },
        seekForward: (details) => {
          const { progress, duration } = get();
          const localOffset = typeof details?.seekOffset === 'number' ? details.seekOffset : 10;
          const maxDuration = duration || progress + localOffset;
          get().seek(Math.min(maxDuration, progress + localOffset));
        },
        seekTo: (details) => {
          if (details.seekTime !== undefined) {
            get().seek(details.seekTime);
          }
        },
      });
    }
    
    // Keyboard media controls for PC (F9-F12)
    // F9: Search (not implemented here, handled by UI)
    // F10: Previous track
    // F11: Play/Pause
    // F12: Next track
    const handleKeyboardControls = (e: KeyboardEvent) => {
      // Only handle if not typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      switch (e.key) {
        case 'F10':
          e.preventDefault();
          console.log('⌨️ F10: Previous track');
          get().prev();
          break;
        case 'F11':
          e.preventDefault();
          console.log('⌨️ F11: Play/Pause');
          get().togglePlay();
          break;
        case 'F12':
          e.preventDefault();
          console.log('⌨️ F12: Next track');
          get().next();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyboardControls);
    console.log('⌨️ Keyboard media controls enabled (F10: Prev, F11: Play/Pause, F12: Next)');
    
    // Sync liked tracks from database for logged-in users
    get().syncLikesFromDatabase();
    playerStoreInitialized = true;
    console.log('[PWA] Player store init complete');
    })();

    try {
      await playerStoreInitPromise;
    } finally {
      playerStoreInitPromise = null;
    }
  },

  initYouTubePlayer: async () => {
    if (playerInstanceInitialized && get().ytPlayer && get().ytPlayerReady) {
      console.log('[PWA] YouTube player already initialized, skipping');
      return;
    }

    console.log('[PWA] Initializing YouTube player instance');

    // Create hidden container for YouTube player
    let container = document.getElementById('yt-player-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-player-container';
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
      document.body.appendChild(container);
    }

    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Wait for API to load
      await new Promise<void>((resolve) => {
        window.onYouTubeIframeAPIReady = () => resolve();
      });
    }

    // Create YouTube player instance
    const player = new window.YT.Player(container, {
      height: '1',
      width: '1',
      videoId: '', // Start with no video to avoid errors
      playerVars: {
        autoplay: 0,
        controls: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        fs: 0,
      },
      events: {
        onReady: () => {
          console.log('✅ YouTube IFrame Player ready');
          try {
            player.setVolume(get().volume * 100);
            set({ ytPlayerReady: true });
            playerInstanceInitialized = true;
            console.log('[PWA] YouTube player init complete');
          } catch (error) {
            console.warn('⚠️  Player volume set failed:', error);
            set({ ytPlayerReady: true }); // Still mark as ready
            playerInstanceInitialized = true;
          }
        },
        onStateChange: (event: any) => {
          const YT = window.YT;
          
          if (event.data === YT.PlayerState.PLAYING) {
            set({ state: 'playing', error: null });

            // Show a native desktop notification for the current track (if available)
            try {
              const current = get().currentTrack;
              if (current && typeof window !== 'undefined' && (window as any).electronAPI && (window as any).electronAPI.notify) {
                (window as any).electronAPI.notify({
                  title: current.title,
                  body: current.artist || '',
                  icon: current.thumbnail || undefined
                }).catch((e: any) => console.warn('Notify failed', e));
              }
            } catch (e) {
              console.warn('Notification attempt failed', e);
            }
            
            // Update media session playback state
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
            
            // Start progress tracking
            const trackProgress = () => {
              if (get().state === 'playing' && get().ytPlayer) {
                try {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  set({ progress: currentTime || 0, duration: duration || 0 });
                  
                  // Update media session position state for background playback
                  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
                    try {
                      navigator.mediaSession.setPositionState({
                        duration: duration || 0,
                        playbackRate: 1,
                        position: currentTime || 0,
                      });
                    } catch (e) {
                      // Some browsers don't support setPositionState
                    }
                  }
                  
                  requestAnimationFrame(trackProgress);
                } catch (e) {
                  // Player might be destroyed
                }
              }
            };
            trackProgress();
            
          } else if (event.data === YT.PlayerState.PAUSED) {
            set({ state: 'paused' });
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'paused';
            }
          } else if (event.data === YT.PlayerState.BUFFERING) {
            set({ state: 'loading' });
          } else if (event.data === YT.PlayerState.ENDED) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ TRACK COMPLETED:', get().currentTrack?.title);
            console.log('⏭️  Playing next track from queue...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            get().next();
          }
        },
        onError: (event: any) => {
          const errorCode = event.data;
          let errorMessage = 'Playback error';
          let shouldRetry = false;
          
          // Error codes: 2 = invalid ID, 5 = HTML5 error, 100 = not found, 101/150 = restricted
          if (errorCode === 100 || errorCode === 101 || errorCode === 150) {
            errorMessage = 'Video not available or restricted';
          } else if (errorCode === 5) {
            errorMessage = 'Video player error';
            shouldRetry = true; // HTML5 errors are often temporary
          } else if (errorCode === 2) {
            errorMessage = 'Invalid video';
          }
          
          console.error('🚫 YouTube error:', errorCode, errorMessage);
          
          const { queue, currentTrack } = get();
          
          // If queue has items, don't set error state - just skip to next
          if (queue.length > 0) {
            console.log('⏭️ Error but queue has items, skipping to next...');
            setTimeout(() => get().next(), 1000);
            return;
          }
          
          // If retryable error and we have a current track, try to replay
          if (shouldRetry && currentTrack) {
            console.log('🔄 Retryable error, attempting to reload current track...');
            set({ state: 'loading', error: null });
            setTimeout(() => {
              const { ytPlayer } = get();
              if (ytPlayer && currentTrack) {
                ytPlayer.loadVideoById({
                  videoId: currentTrack.videoId,
                  startSeconds: 0,
                });
              }
            }, 1500);
            return;
          }
          
          set({ state: 'error', error: errorMessage });
          // Try next track on error
          setTimeout(() => get().next(), 2000);
        },
      },
    });

    set({ ytPlayer: player });
    
    // Handle visibility changes for diagnostics only in PWA mode
    let visibilityHandler: (() => void) | null = null;
    
    visibilityHandler = () => {
      if (isStandalonePwa()) {
        console.log('[PWA] Player visibility handler:', document.visibilityState);
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
  },

  search: async (query: string, limit: number = 10) => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      const response = await fetch(`${API_BASE}/search?${params}`);
      const data = await response.json();
      const results = data.results || [];
      
      // Save search results as discovered tracks (for "For You" section)
      if (results.length > 0) {
        cache.addDiscoveredTracks(results);
      }
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search');
    }
  },

  searchMusic: async (query: string, type: 'playlists' | 'albums' | 'artists', limit: number = 20) => {
    try {
      const params = new URLSearchParams({ q: query, type, limit: limit.toString() });
      const response = await fetch(`${API_BASE}/search/music?${params}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Music search error:', error);
      throw new Error('Failed to search music');
    }
  },

  getYTMusicPlaylistTracks: async (playlistId: string) => {
    try {
      const response = await fetch(`${API_BASE}/ytmusic/playlist/${playlistId}`);
      const data = await response.json();
      return (data.tracks || []) as import('../lib/cache').Track[];
    } catch (error) {
      console.error('YT Music playlist error:', error);
      throw new Error('Failed to load playlist');
    }
  },

  getYTMusicAlbumTracks: async (browseId: string) => {
    try {
      const response = await fetch(`${API_BASE}/ytmusic/album/${browseId}`);
      const data = await response.json();
      return {
        tracks: (data.tracks || []) as import('../lib/cache').Track[],
        title: data.title || 'Unknown Album',
        artist: data.artist || 'Unknown',
        thumbnail: data.thumbnail || '',
        year: data.year
      };
    } catch (error) {
      console.error('YT Music album error:', error);
      throw new Error('Failed to load album');
    }
  },

  getYTMusicArtistTopTracks: async (browseId: string) => {
    try {
      const response = await fetch(`${API_BASE}/ytmusic/artist/${browseId}`);
      const data = await response.json();
      return {
        tracks: (data.tracks || []) as import('../lib/cache').Track[],
        name: data.name || 'Unknown Artist',
        thumbnail: data.thumbnail || '',
        subscribers: data.subscribers
      };
    } catch (error) {
      console.error('YT Music artist error:', error);
      throw new Error('Failed to load artist');
    }
  },

  play: async (track: Track) => {
    console.log('🚀 NEW CODE LOADED - play() called for:', track.title);
    // Mark track as played for "For You" discovery feature
    cache.markTrackAsPlayed(track.videoId);
    await get()._playInternal(track, false);
  },

  _playInternal: async (track: Track, skipReverseQueue: boolean = false) => {
    let { ytPlayer, ytPlayerReady, currentTrack: previousTrack } = get();

    // Wait for player to be ready (with timeout)
    if (!ytPlayer || !ytPlayerReady) {
      console.log('⏳ Waiting for YouTube player to initialize...');
      const maxWait = 5000; // 5 seconds max
      const startTime = Date.now();
      
      while ((!ytPlayer || !ytPlayerReady) && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const state = get();
        ytPlayer = state.ytPlayer;
        ytPlayerReady = state.ytPlayerReady;
      }
      
      if (!ytPlayer || !ytPlayerReady) {
        console.error('❌ YouTube player initialization timeout');
        set({ error: 'Player initialization failed. Please refresh the page.' });
        return;
      }
      
      console.log('✅ YouTube player ready after waiting');
    }

    // 🔄 REVERSE QUEUE LOGIC: Push previous track to reverse queue (history stack)
    // BUT skip if we're navigating backwards (skipReverseQueue = true)
    // NOTE: This is NON-BLOCKING to not delay playback
    if (!skipReverseQueue && previousTrack && previousTrack.videoId !== track.videoId) {
      // Fire and forget - don't await to avoid blocking playback
      (async () => {
        try {
          const { useAuth } = await import('../lib/authStore');
          const token = useAuth.getState().token;
          
          if (token) {
            // LOGGED IN: Database first (non-blocking)
            fetch(`${API_BASE}/history`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                trackId: previousTrack.videoId,
                title: previousTrack.title,
                artist: previousTrack.artist,
                thumbnail: previousTrack.thumbnail,
                duration: previousTrack.duration
              })
            }).then(async (response) => {
              if (response.ok) {
                await cache.pushToReverseQueue(previousTrack);
                console.log('✅ History: Database → IndexedDB synced');
              }
            }).catch(error => {
              console.error('❌ Failed to record history:', error);
            });
          } else {
            // GUEST: IndexedDB only
            await cache.pushToReverseQueue(previousTrack);
            console.log('✅ Guest: History saved to IndexedDB');
          }
          
          console.log('⬅️  PUSHED TO REVERSE QUEUE:', previousTrack.title);
        } catch (error) {
          console.error('History recording error:', error);
        }
      })();
    }

    // Remove track from queue if it exists (normal queue behavior)
    const { queue } = get();
    const trackIndex = queue.findIndex(t => t.videoId === track.videoId);
    if (trackIndex !== -1) {
      const newQueue = queue.filter((_, i) => i !== trackIndex);
      set({ queue: newQueue });
      await cache.removeFromQueue(trackIndex);
      console.log('🗑️ Removed from queue:', track.title);
    }

    // Set state immediately
    set({ 
      state: 'loading', 
      currentTrack: track, 
      error: null,
      progress: 0,
      duration: track.duration || 0,
      isPlayerVisible: true // Show player when user plays something
    });

    console.log('🎵 Playing track:', track.title, 'by', track.artist);

    // Update media session metadata for background playback
    mediaSessionManager.updateMetadata(track);
    mediaSessionManager.updatePlaybackState('playing');

    try {
      console.log('📺 Loading video:', track.videoId);

      // Load and play video directly (no stream fetch needed for iframe)
      ytPlayer.loadVideoById({
        videoId: track.videoId,
        startSeconds: 0,
      });

      // Update cache
      await cache.setLastPlayed(track);

    } catch (error) {
      console.error('Play error:', error);
      set({ state: 'error', error: 'Failed to play track' });
      
      // Auto-try next track on error
      setTimeout(() => {
        get().next();
      }, 2000);
    }
  },

  togglePlay: () => {
    const { ytPlayer, state, currentTrack, ytPlayerReady } = get();
    
    // Auto-recovery: if player is in error or idle state with a track, try to play it
    if ((state === 'error' || state === 'idle') && currentTrack) {
      console.log('🔄 Auto-recovery: attempting to replay current track...');
      set({ error: null }); // Clear any error
      get().play(currentTrack);
      return;
    }
    
    if (!currentTrack || !ytPlayer || !ytPlayerReady) return;

    if (state === 'playing') {
      ytPlayer.pauseVideo();
      mediaSessionManager.updatePlaybackState('paused');
    } else if (state === 'paused') {
      ytPlayer.playVideo();
      mediaSessionManager.updatePlaybackState('playing');
    }
  },

  next: async () => {
    if (nextTransitionInProgress) {
      console.log('⏭️  NEXT ignored: transition already in progress');
      return;
    }

    nextTransitionInProgress = true;
    if (nextTransitionReleaseTimer !== null) {
      window.clearTimeout(nextTransitionReleaseTimer);
      nextTransitionReleaseTimer = null;
    }

    try {
    const { queue, currentTrack } = get();
    const { shuffle, repeatMode, manualQueue, setRepeatMode } = useQueue.getState();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏭️  NEXT BUTTON CLICKED');
    if (currentTrack) console.log('⏩ SKIPPING:', currentTrack.title);
    console.log('📝 Queue length:', queue.length, '| Manual:', manualQueue.length, '| Shuffle:', shuffle, '| Repeat:', repeatMode);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1️⃣ Repeat track — replay current without touching queue
    if (repeatMode === 'track' && currentTrack) {
      get().seek(0);
      const { ytPlayer } = get();
      if (ytPlayer) ytPlayer.playVideo();
      set({ state: 'playing' });
      return;
    }

    // 2️⃣ Manual queue has priority
    if (manualQueue.length > 0) {
      const [nextTrack, ...remaining] = manualQueue;
      useQueue.setState({ manualQueue: remaining });
      await get().play(nextTrack);
      return;
    }

    // 3️⃣ Context queue — with shuffle support
    if (queue.length > 0) {
      let nextTrack: Track;
      let newQueue: Track[];

      if (shuffle) {
        const idx = Math.floor(Math.random() * queue.length);
        nextTrack = queue[idx];
        newQueue = [...queue.slice(0, idx), ...queue.slice(idx + 1)];
      } else {
        [nextTrack, ...newQueue] = queue;
      }

      set({ queue: newQueue });
      await get().play(nextTrack);
      return;
    }

    // 4️⃣ Repeat queue — recycle reverse queue back into play
    if (repeatMode === 'queue') {
      const reverseQueue = await cache.getReverseQueue();
      if (reverseQueue.length > 0) {
        const recycled = shuffle
          ? [...reverseQueue].sort(() => Math.random() - 0.5)
          : [...reverseQueue];
        const [nextTrack, ...rest] = recycled;
        set({ queue: rest });
        await cache.clearReverseQueue();
        await get().play(nextTrack);
        return;
      }
    }

    // 5️⃣ Nothing left — stop playback
    const { ytPlayer } = get();
    if (ytPlayer) ytPlayer.stopVideo();
    set({ state: 'idle', currentTrack: null, progress: 0, duration: 0 });
    mediaSessionManager.updatePlaybackState('none');
    console.log('📭 Queue empty, stopped playback');
    } finally {
      // Keep a tiny cooldown so duplicate ENDED/error callbacks don't race this transition.
      nextTransitionReleaseTimer = window.setTimeout(() => {
        nextTransitionInProgress = false;
        nextTransitionReleaseTimer = null;
      }, 350);
    }
  },

  prev: async () => {
    const { progress, currentTrack } = get();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏮️  PREVIOUS BUTTON CLICKED');
    console.log('⏱️  Current progress:', progress.toFixed(1), 'seconds');
    
    // If more than 3 seconds in, restart current track (first click)
    if (progress > 3) {
      console.log('🔄 Restarting current track (>3s played)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      get().seek(0);
      return;
    }

    // Check if there's a previous track in reverse queue
    const reverseQueue = await cache.getReverseQueue();
    console.log('📚 Reverse queue length:', reverseQueue.length);
    console.log('📋 Reverse queue:', reverseQueue.map(t => t.title).join(' ← '));
    
    if (reverseQueue.length === 0) {
      // No history available, just restart current track
      console.log('❌ No previous track in reverse queue, restarting current');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (currentTrack) {
        get().seek(0);
      }
      return;
    }

    // Pop the previous track from reverse queue (LIFO - stack behavior)
    const previousTrack = await cache.popFromReverseQueue();
    if (!previousTrack) {
      console.log('❌ No previous track found, restarting current');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (currentTrack) {
        get().seek(0);
      }
      return;
    }

    console.log('⏮️  Going back to:', previousTrack.title);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 🔄 REVERSE QUEUE LOGIC: Push current track to FRONT of queue
    // So when user presses Next, they go back to where they were
    if (currentTrack && currentTrack.videoId !== previousTrack.videoId) {
      const { queue } = get();
      const newQueue = [currentTrack, ...queue];
      set({ queue: newQueue });
      await cache.clearQueue();
      for (const track of newQueue) {
        await cache.addToQueue(track);
      }
      console.log('➡️  Pushed current track to front of queue:', currentTrack.title);
    }
    
    // Play the previous track WITHOUT adding to reverse queue (skipReverseQueue = true)
    await get()._playInternal(previousTrack, true);
  },

  seek: (seconds: number) => {
    const { ytPlayer, ytPlayerReady } = get();
    
    if (ytPlayer && ytPlayerReady) {
      ytPlayer.seekTo(seconds, true);
      set({ progress: seconds });
    }
  },

  setVolume: (volume: number) => {
    const { ytPlayer } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (ytPlayer) {
      ytPlayer.setVolume(clampedVolume * 100);
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

  rearrangeQueue: (fromIndex: number, toIndex: number) => {
    const { queue } = get();
    if (fromIndex === toIndex) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    set({ queue: newQueue });
    cache.reorderQueue(fromIndex, toIndex).catch(() => {});
  },

  clearQueue: async () => {
    set({ queue: [] });
    await cache.clearQueue();
  },

  like: async (track: Track) => {
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (token) {
      // LOGGED IN: Push to database FIRST, then sync to IndexedDB
      try {
        const response = await fetch(`${API_BASE}/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            trackId: track.videoId,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            duration: track.duration
          })
        });
        
        if (response.ok) {
          // Success: Now sync to local IndexedDB
          await cache.likeSong(track);
          console.log('✅ Liked: Database → IndexedDB synced');
        } else {
          console.error('❌ Failed to like on database');
        }
      } catch (error) {
        console.error('❌ Failed to like:', error);
      }
    } else {
      // GUEST: Use IndexedDB only
      await cache.likeSong(track);
      console.log('✅ Guest: Liked saved to IndexedDB');
    }
  },

  unlike: async (videoId: string) => {
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (token) {
      // LOGGED IN: Push to database FIRST, then sync to IndexedDB
      try {
        const response = await fetch(`${API_BASE}/likes/${videoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Success: Now sync to local IndexedDB
          await cache.unlikeSong(videoId);
          console.log('✅ Unliked: Database → IndexedDB synced');
        } else {
          console.error('❌ Failed to unlike on database');
        }
      } catch (error) {
        console.error('❌ Failed to unlike:', error);
      }
    } else {
      // GUEST: Use IndexedDB only
      await cache.unlikeSong(videoId);
      console.log('✅ Guest: Unlike saved to IndexedDB');
    }
  },

  // Sync liked tracks from database to local cache for logged-in users
  syncLikesFromDatabase: async () => {
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (!token) return; // Only sync for logged-in users
    
    try {
      const response = await fetch(`${API_BASE}/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const dbLikes = data.likedTracks || [];
      
      // Update local cache with database likes
      for (const like of dbLikes) {
        const track: Track = {
          videoId: like.trackId,
          title: like.title,
          artist: like.artist,
          thumbnail: like.thumbnail || '',
          duration: like.duration || 0
        };
        
        // Add to local cache if not already there
        if (!cache.isLiked(track.videoId)) {
          await cache.likeSong(track);
        }
      }
      
      console.log('✅ Synced', dbLikes.length, 'liked tracks from database');
    } catch (error) {
      console.error('Failed to sync likes from database:', error);
    }
  },

  isLiked: (videoId: string) => {
    // Always check local cache for immediate UI feedback
    return cache.isLiked(videoId);
  },

  // Check if a track is liked (async version for database check)
  checkIsLiked: async (videoId: string): Promise<boolean> => {
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/likes/${videoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        return data.isLiked || false;
      } catch (error) {
        // Fallback to local cache
        return cache.isLiked(videoId);
      }
    }
    
    return cache.isLiked(videoId);
  },

  // Full sync from database to IndexedDB (on login/session start)
  syncFromDatabase: async () => {
    const { useAuth } = await import('../lib/authStore');
    const token = useAuth.getState().token;
    
    if (!token) return;
    
    console.log('🔄 Starting full database → IndexedDB sync...');
    
    try {
      // 1. Sync liked tracks
      const likesResponse = await fetch(`${API_BASE}/likes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        const dbLikes = likesData.likedTracks || [];
        
        // Clear local likes and replace with database likes
        const currentLiked = cache.getLikedSongs();
        for (const track of currentLiked) {
          await cache.unlikeSong(track.videoId);
        }
        
        // Add database likes to local cache
        for (const like of dbLikes) {
          const track: Track = {
            videoId: like.trackId,
            title: like.title,
            artist: like.artist,
            thumbnail: like.thumbnail || '',
            duration: like.duration || 0
          };
          await cache.likeSong(track);
        }
        
        console.log(`✅ Synced ${dbLikes.length} liked tracks from database`);
      }
      
      // 2. Sync play history (recent 50 for reverse queue)
      const historyResponse = await fetch(`${API_BASE}/history?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const dbHistory = historyData.history || [];
        
        // Clear reverse queue and rebuild from database history
        await cache.clearReverseQueue();
        
        // Add history in reverse order (oldest first, so newest is at top of stack)
        for (const item of dbHistory.reverse()) {
          const track: Track = {
            videoId: item.trackId,
            title: item.title,
            artist: item.artist,
            thumbnail: item.thumbnail || '',
            duration: item.duration || 0
          };
          await cache.pushToReverseQueue(track);
        }
        
        console.log(`✅ Synced ${dbHistory.length} history entries from database`);
      }
      
      console.log('✅ Full database → IndexedDB sync complete!');
      
    } catch (error) {
      console.error('❌ Database sync failed:', error);
    }
  },
}));
