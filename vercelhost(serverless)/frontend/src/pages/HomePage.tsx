import { motion } from 'framer-motion';
import { Play, Pause, Music, Loader2 } from 'lucide-react';
import { usePlayer } from '../services/player';

export function HomePage() {
  const { currentTrack, state, togglePlay } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Music size={80} className="text-purple-700 mb-6" />
        <h2 className="text-3xl font-bold text-gray-300 mb-4">
          Welcome to MusicMu
        </h2>
        <p className="text-gray-400 text-center max-w-md mb-2">
          Ad-free music streaming with unlimited skips
        </p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Search for songs to start listening — no interruptions, no forced content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Album Art */}
      <div className="flex items-end gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-64 h-64 flex-shrink-0 group"
        >
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover rounded shadow-2xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center rounded"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-2xl hover:bg-green-400 transition-colors"
              disabled={state === 'loading'}
            >
              {state === 'loading' ? (
                <Loader2 size={28} className="text-black animate-spin" />
              ) : state === 'playing' ? (
                <Pause size={28} fill="black" className="text-black" />
              ) : (
                <Play size={28} fill="black" className="text-black ml-1" />
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="flex-1 pb-4">
          <p className="text-sm font-semibold uppercase text-gray-400 mb-2">
            Now Playing
          </p>
          <motion.h1
            key={currentTrack.videoId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black mb-6 line-clamp-2"
          >
            {currentTrack.title}
          </motion.h1>
          <p className="text-xl text-gray-300">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex items-center gap-8 text-sm text-gray-400">
        <div>
          <span className="font-semibold text-white">Duration: </span>
          {Math.floor(currentTrack.duration / 60)}:
          {(currentTrack.duration % 60).toString().padStart(2, '0')}
        </div>
        <div>
          <span className="font-semibold text-white">Format: </span>
          Audio-Only Stream
        </div>
      </div>
    </div>
  );
}
