import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Plus, Heart } from 'lucide-react';
import { usePlayer } from '../services/player';
import { Track } from '../lib/cache';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(10);
  const { play, addToQueue, currentTrack, state, like, unlike, isLiked } = usePlayer();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setCurrentLimit(10); // Reset to initial limit
    try {
      const searchResults = await usePlayer.getState().search(query, 10);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!query.trim()) return;
    
    // Maximum limit of 50 results
    if (currentLimit >= 50) return;

    setLoadingMore(true);
    try {
      const newLimit = Math.min(currentLimit + 10, 50); // Cap at 50
      const searchResults = await usePlayer.getState().search(query, newLimit);
      setResults(searchResults);
      setCurrentLimit(newLimit);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlay = async (track: Track, index: number) => {
    // Play the selected track
    await play(track);
    
    // Add all songs after this one to the queue
    const songsAfter = results.slice(index + 1);
    for (const song of songsAfter) {
      await addToQueue(song);
    }
  };

  const handleAddToQueue = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    await addToQueue(track);
  };

  const handleToggleLike = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (isLiked(track.videoId)) {
      await unlike(track.videoId);
    } else {
      await like(track);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black mb-4 md:mb-6">Search</h1>
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={20}
          />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/10 border-0 rounded-full px-12 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 text-base"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-1.5 md:px-6 md:py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Top Results</h2>
          <div className="space-y-1">
            {results.map((track, index) => {
              const isPlaying =
                currentTrack?.videoId === track.videoId && state === 'playing';
              const liked = isLiked(track.videoId);

              return (
                <motion.div
                  key={track.videoId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handlePlay(track, index)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>

                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="flex gap-0.5 items-center flex-shrink-0">
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleToggleLike(e, track)}
                      className={`p-2 rounded-full transition-colors ${liked ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => handleAddToQueue(e, track)}
                      className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Load More Button */}
          {currentLimit < 50 && (
            <div className="flex justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:bg-white/5 disabled:cursor-not-allowed px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Load More ({currentLimit}/50)</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !query && (
        <div className="text-center py-12 md:py-20">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-700 md:w-16 md:h-16" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">
            Search for songs and artists
          </h3>
          <p className="text-sm md:text-base text-gray-500">
            Find your favorite music from YouTube
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 md:py-20">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-700 md:w-16 md:h-16" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">
            No results found for "{query}"
          </h3>
          <p className="text-sm md:text-base text-gray-500">Try different keywords</p>
        </div>
      )}
    </div>
  );
}
