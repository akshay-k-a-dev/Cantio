import { motion } from 'framer-motion';
import { List, Play, X, Music } from 'lucide-react';
import { usePlayer } from '../services/player';
import { Track } from '../lib/cache';

export function QueuePage() {
  const { queue, currentTrack, play, removeFromQueue, clearQueue, state } = usePlayer();

  const handlePlay = async (track: Track) => {
    // Simply play the track - it will be auto-removed from queue
    await play(track);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <List size={80} className="text-gray-700 mb-6" />
        <h2 className="text-3xl font-bold text-gray-400 mb-2">
          Your queue is empty
        </h2>
        <p className="text-gray-500">
          Add songs from search or liked songs
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-4">Queue</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-400">{queue.length} songs in queue</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => clearQueue()}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
          >
            Clear Queue
          </motion.button>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-2">
        {queue.map((track, index) => {
          const isPlaying = currentTrack?.videoId === track.videoId && state === 'playing';

          return (
            <motion.div
              key={`${track.videoId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 group transition-colors"
            >
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePlay(track)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isPlaying ? (
                  <Music size={18} className="text-green-500" />
                ) : (
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                )}
              </motion.button>

              {/* Thumbnail */}
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                  {track.title}
                </p>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              </div>

              {/* Duration */}
              <div className="text-sm text-gray-400 flex-shrink-0">
                {formatDuration(track.duration)}
              </div>

              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFromQueue(index)}
                className="p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                title="Remove from queue"
              >
                <X size={18} className="text-gray-400 hover:text-white" />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
