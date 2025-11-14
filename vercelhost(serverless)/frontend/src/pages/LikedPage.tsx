import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Pause, Clock, Plus } from 'lucide-react';
import { usePlayer } from '../services/player';
import { cache, Track } from '../lib/cache';

export function LikedPage() {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const { play, addToQueue, clearQueue, currentTrack, state, togglePlay } = usePlayer();

  useEffect(() => {
    loadLikedSongs();
  }, []);

  const loadLikedSongs = () => {
    const data = cache.getCache();
    // Reverse the array so last added songs appear first
    setLikedSongs([...data.liked].reverse());
  };

  const handlePlay = async (track: Track) => {
    // When clicking a song in liked playlist:
    // 1. Clear the queue
    // 2. Add all songs from this track onwards to queue
    // 3. Play the clicked track
    await clearQueue();
    
    const clickedIndex = likedSongs.findIndex(t => t.videoId === track.videoId);
    const songsToQueue = likedSongs.slice(clickedIndex);
    
    for (const song of songsToQueue) {
      await addToQueue(song);
    }
    
    await play(track);
  };

  const handleAddToQueue = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    await addToQueue(track);
  };

  const handlePlayAll = async () => {
    if (likedSongs.length === 0) return;
    
    // Clear queue and add all liked songs in order
    await clearQueue();
    for (const track of likedSongs) {
      await addToQueue(track);
    }
    // Play first song (which will auto-remove from queue and continue)
    await play(likedSongs[0]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = likedSongs.reduce((acc, track) => acc + track.duration, 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMins = Math.floor((totalDuration % 3600) / 60);

  if (likedSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Heart size={80} className="text-gray-700 mb-6" />
        <h2 className="text-3xl font-bold text-gray-400 mb-2">
          No liked songs yet
        </h2>
        <p className="text-gray-500">
          Songs you like will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Playlist Header */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-60 h-60 bg-gradient-to-br from-purple-500 to-pink-500 rounded shadow-2xl flex items-center justify-center flex-shrink-0">
          <Heart size={100} fill="white" className="text-white" />
        </div>
        <div className="flex-1 pb-4">
          <p className="text-sm font-semibold uppercase mb-2">Playlist</p>
          <h1 className="text-6xl font-black mb-6">Liked Songs</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{likedSongs.length} songs</span>
            {totalDuration > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  {totalHours > 0 && `${totalHours} hr `}
                  {totalMins} min
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Play Button */}
      <div className="mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl hover:bg-green-400 transition-colors"
        >
          <Play size={24} fill="black" className="text-black ml-1" />
        </motion.button>
      </div>

      {/* Song List */}
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
          <div>#</div>
          <div>Title</div>
          <div>Artist</div>
          <div className="flex justify-end">
            <Clock size={16} />
          </div>
          <div></div>
        </div>

        {/* Tracks */}
        {likedSongs.map((track, index) => {
          const isPlaying = currentTrack?.videoId === track.videoId && state === 'playing';

          return (
            <motion.div
              key={track.videoId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handlePlay(track)}
              className="grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 rounded hover:bg-white/10 cursor-pointer group items-center"
            >
              <div className="text-gray-400 text-sm group-hover:hidden">
                {isPlaying ? (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                    <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                    <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                  </div>
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden group-hover:block">
                <Play size={14} fill="white" className="text-white" />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-10 h-10 rounded"
                />
                <div className="min-w-0">
                  <p className={`truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                    {track.title}
                  </p>
                </div>
              </div>

              <div className="text-gray-400 text-sm truncate">
                {track.artist}
              </div>

              <div className="text-gray-400 text-sm text-right">
                {formatDuration(track.duration)}
              </div>

              <div className="flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleAddToQueue(e, track)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Add to queue"
                >
                  <Plus size={16} className="text-gray-400 hover:text-white" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
