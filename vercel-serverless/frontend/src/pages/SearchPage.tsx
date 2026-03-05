import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Heart, Plus, ListMusic, Disc3, Mic2, PlayCircle } from 'lucide-react';
import { usePlayer } from '../services/player';
import { Track } from '../lib/cache';
import { AddToPlaylistDropdown } from '../components/AddToPlaylistDropdown';

type SearchFilter = 'songs' | 'playlists' | 'albums' | 'artists';

interface MusicPlaylistResult {
  type: 'playlist';
  playlistId: string;
  title: string;
  author: string;
  thumbnail: string;
  trackCount?: number;
}

interface MusicAlbumResult {
  type: 'album';
  browseId: string;
  title: string;
  artist: string;
  thumbnail: string;
  year?: string;
}

interface MusicArtistResult {
  type: 'artist';
  browseId: string;
  name: string;
  thumbnail: string;
  subscribers?: string;
}

type MusicResult = MusicPlaylistResult | MusicAlbumResult | MusicArtistResult;

const FILTERS: { id: SearchFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'songs',     label: 'Songs',     icon: <ListMusic size={14} /> },
  { id: 'playlists', label: 'Playlists', icon: <PlayCircle size={14} /> },
  { id: 'albums',    label: 'Albums',    icon: <Disc3 size={14} /> },
  { id: 'artists',   label: 'Artists',   icon: <Mic2 size={14} /> },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('songs');
  const [songResults, setSongResults] = useState<Track[]>([]);
  const [musicResults, setMusicResults] = useState<MusicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(10);
  const { play, addToQueue, currentTrack, state, like, unlike, isLiked } = usePlayer();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setCurrentLimit(10);
    try {
      if (filter === 'songs') {
        const results = await usePlayer.getState().search(query, 10);
        setSongResults(results);
        setMusicResults([]);
      } else {
        const results = await usePlayer.getState().searchMusic(query, filter, 20);
        setMusicResults(results);
        setSongResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSongResults([]);
      setMusicResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setFilter(newFilter);
    setSongResults([]);
    setMusicResults([]);
    setCurrentLimit(10);
  };

  const handleLoadMore = async () => {
    if (!query.trim() || filter !== 'songs') return;
    if (currentLimit >= 50) return;
    setLoadingMore(true);
    try {
      const newLimit = Math.min(currentLimit + 10, 50);
      const results = await usePlayer.getState().search(query, newLimit);
      setSongResults(results);
      setCurrentLimit(newLimit);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlay = async (track: Track, index: number) => {
    await play(track);
    const songsAfter = songResults.slice(index + 1);
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

  const handleMusicCardClick = (type: 'playlist' | 'album' | 'artist', id: string) => {
    navigate(`/ytmusic/${type}/${id}`);
  };

  const hasResults = filter === 'songs' ? songResults.length > 0 : musicResults.length > 0;

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

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Songs Results */}
      {!loading && filter === 'songs' && songResults.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Songs</h2>
          <div className="space-y-1">
            {songResults.map((track, index) => {
              const isPlaying = currentTrack?.videoId === track.videoId && state === 'playing';
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
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                  {isPlaying && (
                    <div className="flex gap-0.5 items-center flex-shrink-0">
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleToggleLike(e, track)}
                      className={`p-2 rounded-full transition-colors ${liked ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <AddToPlaylistDropdown
                      track={track}
                      onAddToQueue={() => handleAddToQueue(new MouseEvent('click') as any, track)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

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

      {/* Music (Playlists / Albums / Artists) Results */}
      {!loading && filter !== 'songs' && musicResults.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 capitalize">{filter}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {musicResults.map((item, index) => {
              if (item.type === 'playlist') {
                return (
                  <motion.div
                    key={item.playlistId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleMusicCardClick('playlist', item.playlistId)}
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer transition-colors group"
                  >
                    <div className="relative mb-3">
                      <img
                        src={item.thumbnail || '/offline.html'}
                        alt={item.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.author}</p>
                    {item.trackCount != null && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.trackCount} tracks</p>
                    )}
                  </motion.div>
                );
              }

              if (item.type === 'album') {
                return (
                  <motion.div
                    key={item.browseId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleMusicCardClick('album', item.browseId)}
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors cursor-pointer"
                  >
                    <div className="mb-3">
                      <img
                        src={item.thumbnail || '/offline.html'}
                        alt={item.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.artist}</p>
                    {item.year && <p className="text-xs text-gray-500 mt-0.5">{item.year}</p>}
                  </motion.div>
                );
              }

              if (item.type === 'artist') {
                return (
                  <motion.div
                    key={item.browseId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleMusicCardClick('artist', item.browseId)}
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors text-center cursor-pointer"
                  >
                    <div className="mb-3">
                      <img
                        src={item.thumbnail || '/offline.html'}
                        alt={item.name}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full aspect-square object-cover rounded-full"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    {item.subscribers && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.subscribers}</p>
                    )}
                  </motion.div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasResults && !query && (
        <div className="text-center py-12 md:py-20">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-700 md:w-16 md:h-16" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-400 mb-2">
            Search for songs, playlists, albums & artists
          </h3>
          <p className="text-sm md:text-base text-gray-500">
            Use the filters above to switch between YouTube and YouTube Music
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && !hasResults && query && (
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
