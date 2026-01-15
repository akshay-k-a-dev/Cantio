import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Clock, Loader2 } from 'lucide-react';
import { usePlayer } from '../services/player';
import { cache, Track } from '../lib/cache';
import { useAuth } from '../lib/authStore';
import { getLikedTracks } from '../services/api';
import { AddToPlaylistDropdown } from '../components/AddToPlaylistDropdown';

export function LikedPage() {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, addToQueue, clearQueue, currentTrack, state, togglePlay } = usePlayer();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadLikedSongs();
  }, [isAuthenticated]);

  const loadLikedSongs = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Fetch from database for logged-in users
        const dbLikes = await getLikedTracks();
        const tracks: Track[] = dbLikes.map(like => ({
          videoId: like.trackId,
          title: like.title,
          artist: like.artist,
          thumbnail: like.thumbnail || '',
          duration: like.duration || 0
        }));
        setLikedSongs(tracks);
      } else {
        // Use local cache for guests
        const data = cache.getCache();
        setLikedSongs([...data.liked].reverse());
      }
    } catch (error) {
      console.error('Failed to load liked songs:', error);
      // Fallback to local cache
      const data = cache.getCache();
      setLikedSongs([...data.liked].reverse());
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading liked songs...</p>
      </div>
    );
  }

  if (likedSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] px-4">
        <Heart size={60} className="md:hidden text-gray-700 mb-4" />
        <Heart size={80} className="hidden md:block text-gray-700 mb-6" />
        <h2 className="text-xl md:text-3xl font-bold text-gray-400 mb-2 text-center">
          No liked songs yet
        </h2>
        <p className="text-gray-500 text-sm md:text-base text-center">
          Songs you like will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Playlist Header - responsive */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="w-32 h-32 md:w-60 md:h-60 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded shadow-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
          <Heart size={48} className="md:hidden" fill="white" />
          <Heart size={100} className="hidden md:block" fill="white" />
        </div>
        <div className="flex-1 text-center md:text-left md:pb-4">
          <p className="text-xs md:text-sm font-semibold uppercase mb-1 md:mb-2 text-white/60">Playlist</p>
          <h1 className="text-2xl md:text-6xl font-black mb-2 md:mb-6">Liked Songs</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm">
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
      <div className="mb-4 md:mb-8 flex justify-center md:justify-start">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl hover:bg-green-400 transition-colors"
        >
          <Play size={22} fill="black" className="text-black ml-1" />
        </motion.button>
      </div>

      {/* Song List */}
      <div className="space-y-1">
        {/* Header - hidden on mobile */}
        <div className="hidden md:grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
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
              className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-2 rounded-lg md:rounded hover:bg-white/10 active:bg-white/15 cursor-pointer group md:grid md:grid-cols-[16px_4fr_2fr_1fr_40px] md:gap-4"
            >
              {/* Index/Play indicator - desktop only */}
              <div className="hidden md:block text-gray-400 text-sm group-hover:hidden">
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
              <div className="hidden md:hidden md:group-hover:block">
                <Play size={14} fill="white" className="text-white" />
              </div>

              {/* Thumbnail */}
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded object-cover flex-shrink-0 md:hidden"
              />

              {/* Title + Artist (mobile layout) */}
              <div className="flex-1 min-w-0 md:hidden">
                <p className={`truncate text-sm font-medium ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                  {track.title}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {track.artist}
                </p>
              </div>

              {/* Playing indicator - mobile */}
              {isPlaying && (
                <div className="flex gap-0.5 items-center md:hidden">
                  <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                  <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                  <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                </div>
              )}

              {/* Desktop: Title with thumbnail */}
              <div className="hidden md:flex items-center gap-3 min-w-0">
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

              {/* Desktop: Artist */}
              <div className="hidden md:block text-gray-400 text-sm truncate">
                {track.artist}
              </div>

              {/* Desktop: Duration */}
              <div className="hidden md:block text-gray-400 text-sm text-right">
                {formatDuration(track.duration)}
              </div>

              {/* Desktop: Add to queue */}
              <div className="hidden md:flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100">
                  <AddToPlaylistDropdown
                    track={track}
                    onAddToQueue={() => handleAddToQueue(new MouseEvent('click') as any, track)}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
