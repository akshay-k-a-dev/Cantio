import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, List, Volume2 } from 'lucide-react';
import { usePlayer } from '../services/player';
import { useEffect, useState } from 'react';

export function MusicPlayerCard() {
  const {
    state,
    currentTrack,
    progress,
    duration,
    volume,
    isLiked,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    like,
    unlike,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setLiked(isLiked(currentTrack.videoId));
    }
  }, [currentTrack, isLiked]);

  if (!currentTrack) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-400">No track playing. Search for music to get started!</p>
      </div>
    );
  }

  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    seek(percent * duration);
  };

  const handleLike = async () => {
    if (liked) {
      await unlike(currentTrack.videoId);
    } else {
      await like(currentTrack);
    }
    setLiked(!liked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Album Art */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-purple-600 to-pink-600">
        {currentTrack.thumbnail ? (
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <List size={64} className="text-white/30" />
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-6">
        <motion.h2
          key={currentTrack.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold mb-1 truncate"
        >
          {currentTrack.title}
        </motion.h2>
        <p className="text-gray-300 mb-6 truncate">{currentTrack.artist}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            onClick={handleProgressClick}
            className="h-2 bg-white/10 rounded-full cursor-pointer group"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
              style={{ width: `${(progress / duration) * 100 || 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full transition-all ${
              liked
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <SkipBack size={24} />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>

            <button
              onClick={next}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <Volume2 size={20} />
            </button>

            {showVolume && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full right-0 mb-2 glass rounded-lg p-3"
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-24 accent-purple-500"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {state === 'error' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-200">
            Failed to load track. Try another source.
          </div>
        )}
      </div>
    </motion.div>
  );
}
