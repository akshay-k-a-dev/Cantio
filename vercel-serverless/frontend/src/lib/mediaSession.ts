import { Track } from './cache';

interface MediaSessionManager {
  updateMetadata: (track: Track) => void;
  updatePlaybackState: (state: 'playing' | 'paused' | 'none') => void;
  setHandlers: (handlers: {
    play: () => void;
    pause: () => void;
    nextTrack?: () => void;
    previousTrack?: () => void;
    stop?: () => void;
    seekBackward?: (details: any) => void;
    seekForward?: (details: any) => void;
    seekTo?: (details: any) => void;
  }) => void;
}

class MediaSessionManagerImpl implements MediaSessionManager {

  updateMetadata(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        artwork: [
          {
            src: track.thumbnail,
            sizes: '480x360',
            type: 'image/jpeg',
          },
          {
            src: track.thumbnail.replace('hqdefault', 'maxresdefault'),
            sizes: '1280x720',
            type: 'image/jpeg',
          },
        ],
      });
      console.log('📱 Media session metadata updated:', track.title);
    }
  }

  updatePlaybackState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
      console.log('📱 Media session playback state:', state);
    }
  }

  setHandlers(handlers: {
    play: () => void;
    pause: () => void;
    nextTrack?: () => void;
    previousTrack?: () => void;
    stop?: () => void;
    seekBackward?: (details: any) => void;
    seekForward?: (details: any) => void;
    seekTo?: (details: any) => void;
  }) {
    if ('mediaSession' in navigator) {
      const registerAction = (
        action: MediaSessionAction,
        handler: MediaSessionActionHandler | null
      ) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.log(`📱 Media session action not supported: ${action}`);
        }
      };

      registerAction('play', () => {
        console.log('📱 Media session: play');
        handlers.play();
      });

      registerAction('pause', () => {
        console.log('📱 Media session: pause');
        handlers.pause();
      });

      registerAction('nexttrack', handlers.nextTrack ? () => {
        console.log('📱 Media session: next track');
        handlers.nextTrack?.();
      } : null);

      registerAction('previoustrack', handlers.previousTrack ? () => {
        console.log('📱 Media session: previous track');
        handlers.previousTrack?.();
      } : null);

      registerAction('stop', handlers.stop ? () => {
        console.log('📱 Media session: stop');
        handlers.stop?.();
      } : null);

      registerAction('seekbackward', handlers.seekBackward ? (details: any) => {
        console.log('📱 Media session: seek backward', details?.seekOffset);
        handlers.seekBackward?.(details);
      } : null);

      registerAction('seekforward', handlers.seekForward ? (details: any) => {
        console.log('📱 Media session: seek forward', details?.seekOffset);
        handlers.seekForward?.(details);
      } : null);

      registerAction('seekto', handlers.seekTo ? (details: any) => {
        console.log('📱 Media session: seek to', details.seekTime);
        handlers.seekTo?.(details);
      } : null);

      console.log('📱 Media session handlers registered');
    }
  }
}

export const mediaSessionManager = new MediaSessionManagerImpl();
