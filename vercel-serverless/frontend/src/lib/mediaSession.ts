import { Track } from './cache';

interface MediaSessionManager {
  updateMetadata: (track: Track) => void;
  updatePlaybackState: (state: 'playing' | 'paused' | 'none') => void;
  setHandlers: (handlers: {
    play: () => void;
    pause: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
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
    seekTo: (details: any) => void;
  }) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        console.log('📱 Media session: play');
        handlers.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('📱 Media session: pause');
        handlers.pause();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('📱 Media session: next track');
        handlers.nextTrack();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('📱 Media session: previous track');
        handlers.previousTrack();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        console.log('📱 Media session: seek to', details.seekTime);
        handlers.seekTo(details);
      });

      console.log('📱 Media session handlers registered');
    }
  }
}

export const mediaSessionManager = new MediaSessionManagerImpl();
