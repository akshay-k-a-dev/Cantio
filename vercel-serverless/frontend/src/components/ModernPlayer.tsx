import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Loader2 } from 'lucide-react';
import { usePlayer } from '../services/player';

export default function ModernPlayer() {
  const {
    currentTrack,
    state,
    progress,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    like,
    unlike,
    isLiked,
  } = usePlayer();

  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const liked = currentTrack ? isLiked(currentTrack.videoId) : false;

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    if (liked) {
      await unlike(currentTrack.videoId);
    } else {
      await like(currentTrack);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentTrack ? (
            <motion.div
              key={currentTrack.videoId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Album Art */}
              <motion.div
                className="relative aspect-square w-full mb-8 rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Loading Overlay */}
                {state === 'loading' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                  </motion.div>
                )}
              </motion.div>

              {/* Track Info */}
              <div className="mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-bold text-white mb-2 truncate"
                >
                  {currentTrack.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-purple-200 truncate"
                >
                  {currentTrack.artist}
                </motion.p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className="h-2 bg-white/20 rounded-full cursor-pointer group mb-2 overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full relative"
                    style={{ width: `${(progress / duration) * 100}%` }}
                    layout
                  >
                    <motion.div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between text-sm text-purple-200">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                {/* Previous */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prev}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <SkipBack className="w-6 h-6" fill="currentColor" />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  disabled={state === 'loading'}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xl hover:shadow-purple-500/50 transition-shadow disabled:opacity-50"
                >
                  {state === 'loading' ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : state === 'playing' ? (
                    <Pause className="w-8 h-8" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  )}
                </motion.button>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <SkipForward className="w-6 h-6" fill="currentColor" />
                </motion.button>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between">
                {/* Like Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleLike}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? 'fill-pink-500 text-pink-500' : ''}`}
                  />
                </motion.button>

                {/* Volume Control */}
                <div className="flex items-center gap-3 flex-1 max-w-xs ml-auto">
                  <button
                    onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <div
                    ref={volumeBarRef}
                    onClick={handleVolumeClick}
                    className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer group overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full relative"
                      style={{ width: `${volume * 100}%` }}
                      layout
                    >
                      <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>
                  <span className="text-white/60 text-sm w-12 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/60 py-20"
            >
              <p className="text-xl">No track playing</p>
              <p className="text-sm mt-2">Search for music to get started</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
