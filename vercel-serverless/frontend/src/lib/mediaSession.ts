import { Track } from './cache';

interface MediaSessionManager {
  updateMetadata: (track: Track) => void;
  updatePlaybackState: (state: 'playing' | 'paused' | 'none') => void;
  setHandlers: (handlers: {
    play: () => void;
    pause: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    stop: () => void;
    seekBackward: (offset: number) => void;
    seekForward: (offset: number) => void;
    seekTo: (details: any) => void;
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
    nextTrack: () => void;
    previousTrack: () => void;
    stop: () => void;
    seekBackward: (offset: number) => void;
    seekForward: (offset: number) => void;
    seekTo: (details: any) => void;
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

      registerAction('nexttrack', () => {
        console.log('📱 Media session: next track');
        handlers.nextTrack();
      });

      registerAction('previoustrack', () => {
        console.log('📱 Media session: previous track');
        handlers.previousTrack();
      });

      registerAction('stop', () => {
        console.log('📱 Media session: stop');
        handlers.stop();
      });

      registerAction('seekbackward', (details: any) => {
        const offset = details?.seekOffset ?? 10;
        console.log('📱 Media session: seek backward', offset);
        handlers.seekBackward(offset);
      });

      registerAction('seekforward', (details: any) => {
        const offset = details?.seekOffset ?? 10;
        console.log('📱 Media session: seek forward', offset);
        handlers.seekForward(offset);
      });

      registerAction('seekto', (details: any) => {
        console.log('📱 Media session: seek to', details.seekTime);
        handlers.seekTo(details);
      });

      console.log('📱 Media session handlers registered');
    }
  }
}

export const mediaSessionManager = new MediaSessionManagerImpl();
