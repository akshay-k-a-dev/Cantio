import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Heart, Plus, ListMusic, Disc3, Mic2, PlayCircle, X, Music } from 'lucide-react';
import { usePlayer } from '../services/player';
import { Track } from '../lib/cache';
import { AddToPlaylistDropdown } from '../components/AddToPlaylistDropdown';
import { usePlaylist } from '../lib/playlistStore';
import {
  useSearchSession,
  SearchFilter,
  MusicResult,
} from '../lib/searchSessionStore';
import { useSearchPlaybackHistory } from '../lib/searchPlaybackHistoryStore';
import { RecentFromSearch } from '../components/RecentFromSearch';

const FILTERS: { id: SearchFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'songs',     label: 'Songs',     icon: <ListMusic size={14} /> },
  { id: 'playlists', label: 'Playlists', icon: <PlayCircle size={14} /> },
  { id: 'albums',    label: 'Albums',    icon: <Disc3 size={14} /> },
  { id: 'artists',   label: 'Artists',   icon: <Mic2 size={14} /> },
];

export function SearchPage() {
  const navigate = useNavigate();

  // ── Session store (in-memory — survives route nav, clears on refresh) ──
  const {
    query, filter, songResults, musicResults,
    loading, loadingMore, currentLimit,
    setQuery, setFilter: setSessionFilter,
    newSearch, loadMore, clear: clearSearch,
  } = useSearchSession();

  // ── Player & playlist hooks ──────────────────────────────────────
  const { play, appendQueue, playWithRecommendations, currentTrack, state, like, unlike, isLiked } = usePlayer();
  const { publicPlaylists, searchPublicPlaylists } = usePlaylist();

  // ── Search playback history (IndexedDB — survives refresh) ──────
  const { recordPlay, hydrate: hydrateHistory } = useSearchPlaybackHistory();

  // ── Fetch functions (stable references) ──────────────────────────
  const fetchSongs = useCallback(
    (q: string, limit: number) => usePlayer.getState().search(q, limit),
    [],
  );
  const fetchMusic = useCallback(
    (q: string, f: string, limit: number) => usePlayer.getState().searchMusic(q, f as any, limit),
    [],
  );
  const fetchPublicPlaylists = useCallback(
    async (q: string) => { await searchPublicPlaylists(q); },
    [searchPublicPlaylists],
  );

  // ── Hydrate play history on mount ────────────────────────────────
  useEffect(() => {
    hydrateHistory();
  }, [hydrateHistory]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await newSearch(fetchSongs, fetchMusic, fetchPublicPlaylists);
  };

  const handleFilterChange = (newFilter: SearchFilter) => {
    setSessionFilter(newFilter);
  };

  const handleLoadMore = async () => {
    await loadMore(fetchSongs);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  // Play track and automatically build a recommendation queue from
  // YouTube Music related tracks. All fetch/prioritize/dedup logic
  // lives in playWithRecommendations inside the player service.
  const handlePlay = async (track: Track, _index: number) => {
    // Record in search-origin play history
    recordPlay({
      id: track.videoId,
      type: 'song',
      title: track.title,
      subtitle: track.artist,
      artwork: track.thumbnail,
      searchQuery: query,
    });
    await playWithRecommendations(track);
  };

  const handleAddToQueue = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    await appendQueue([track]);
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
    // Find the item data to record in search play history
    const item = musicResults.find((r: MusicResult) => {
      if (r.type === 'playlist') return r.playlistId === id;
      if (r.type === 'album' || r.type === 'artist') return r.browseId === id;
      return false;
    });
    if (item) {
      recordPlay({
        id,
        type: item.type as 'playlist' | 'album' | 'artist',
        title: item.type === 'artist' ? item.name : item.title,
        subtitle: item.type === 'playlist' ? item.author : item.type === 'album' ? item.artist : (item.subscribers || ''),
        artwork: item.thumbnail,
        searchQuery: query,
      });
    }
    navigate(`/ytmusic/${type}/${id}`);
  };

  const hasResults = filter === 'songs' ? songResults.length > 0 : musicResults.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 md:mb-6">Search</h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <SearchIcon
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
            <input
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-white/10 border-0 rounded-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 md:py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {/* Clear search X button — inside the input, right side */}
            {(query || hasResults) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-white active:text-white hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation"
                aria-label="Clear search"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex-shrink-0 bg-white text-black px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 rounded-full font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs — horizontally scrollable on small screens */}
        <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                filter === f.id
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/25'
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
          <div className="space-y-0.5 sm:space-y-1">
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
                  className="flex items-center gap-2.5 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group touch-manipulation"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 overflow-hidden bg-white/5 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music size={20} className="text-gray-500" />
                    </div>
                    {track.thumbnail && (
                      <img
                        src={track.thumbnail}
                        alt=""
                        loading="lazy"
                        className="relative w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#518EAC]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                  {isPlaying && (
                    <div className="flex gap-0.5 items-center flex-shrink-0">
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse" />
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse delay-150" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleToggleLike(e, track)}
                      className={`p-2 rounded-full transition-colors ${liked ? 'text-[#A4C4D4]' : 'text-gray-400'}`}
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

      {/* Public Playlists Results */}
      {!loading && query.trim() && publicPlaylists.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Public Playlists</h2>
          <div className="space-y-2">
            {publicPlaylists.map((playlist) => (
              <motion.button
                key={playlist.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate(`/public/playlist/${playlist.id}`)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 active:bg-white/15 transition text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <PlayCircle size={18} className="text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {playlist.user?.name || playlist.user?.username || 'Creator'} • {playlist._count?.tracks || 0} tracks
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Music (Playlists / Albums / Artists) Results */}
      {!loading && filter !== 'songs' && musicResults.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 capitalize">{filter}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
            {musicResults.map((item: MusicResult, index: number) => {
              if (item.type === 'playlist') {
                return (
                  <motion.div
                    key={item.playlistId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleMusicCardClick('playlist', item.playlistId)}
                    className="bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl p-2 sm:p-3 cursor-pointer transition-colors group touch-manipulation"
                  >
                    <div className="relative mb-3 w-full aspect-square rounded-lg overflow-hidden bg-white/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={32} className="text-gray-500" />
                      </div>
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          className="relative w-full h-full object-cover"
                        />
                      )}
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
                    className="bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl p-2 sm:p-3 transition-colors cursor-pointer touch-manipulation"
                  >
                    <div className="mb-3 w-full aspect-square rounded-lg overflow-hidden bg-white/5 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Disc3 size={32} className="text-gray-500" />
                      </div>
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          className="relative w-full h-full object-cover"
                        />
                      )}
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
                    className="bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl p-2 sm:p-3 transition-colors text-center cursor-pointer touch-manipulation"
                  >
                    <div className="mb-3 w-full aspect-square rounded-full overflow-hidden bg-white/5 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Mic2 size={32} className="text-gray-500" />
                      </div>
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          className="relative w-full h-full object-cover"
                        />
                      )}
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

      {/* Recent From Search — shown when no active search results */}
      {!loading && !hasResults && (
        <RecentFromSearch />
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
