import { motion } from 'framer-motion';
import { Music, Loader2, RefreshCw, Sparkles, Play, Pause } from 'lucide-react';
import { usePlayer } from '../services/player';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authStore';
import { getRecommendations, getGuestRecommendations, Recommendations } from '../services/recommendations';
import RecommendationSection from '../components/RecommendationSection';
import ArtistCard from '../components/ArtistCard';
import { openFullScreenPlayer } from '../components/PlayerBar';

export function HomePage() {
  const { currentTrack, state } = usePlayer();
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        const data = await getRecommendations();
        setRecommendations(data);
      } else {
        const data = await getGuestRecommendations();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [isAuthenticated]);

  // Compact "Now Playing" mini-card (only when track is playing)
  const NowPlayingMini = () => {
    if (!currentTrack) return null;
    
    const { togglePlay } = usePlayer();
    
    const handleCardClick = () => {
      // On mobile, open full-screen player
      if (window.innerWidth < 768) {
        openFullScreenPlayer();
      }
    };
    
    const handlePlayPause = (e: React.MouseEvent) => {
      e.stopPropagation();
      togglePlay();
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div 
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md cursor-pointer hover:bg-white/10 transition-colors"
          onClick={handleCardClick}
        >
          <div className="relative" onClick={handlePlayPause}>
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover shadow-lg"
            />
            {/* Play/Pause overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              {state === 'playing' ? (
                <Pause size={20} className="text-white" fill="white" />
              ) : (
                <Play size={20} className="text-white ml-0.5" fill="white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-medium mb-0.5">
              Now Playing
            </p>
            <h3 className="text-sm font-semibold text-white truncate">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
          {state === 'playing' && (
            <div className="flex gap-0.5 items-end h-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-purple-500 rounded-full"
                  animate={{
                    height: ['4px', '16px', '4px'],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Welcome section for empty state
  const WelcomeSection = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-transparent border border-white/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-purple-400" />
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
              Ad-Free Music
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to MusicMu
          </h1>
          <p className="text-gray-400 max-w-md">
            Search for songs to start listening. No ads, unlimited skips, no interruptions.
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Compact Now Playing (replaces giant hero) */}
      <NowPlayingMini />

      {/* Welcome section only when no recommendations */}
      {!currentTrack && recommendations?.recentlyPlayed?.length === 0 && 
       recommendations?.mostPlayed?.length === 0 && (
        <WelcomeSection />
      )}

      {/* For You Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">For You</h2>
          <p className="text-sm text-gray-500 mt-0.5">Personalized picks based on your taste</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-purple-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading your music...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-6 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadRecommendations}
            className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Recommendations */}
      {!loading && !error && recommendations && (
        <div className="space-y-8">
          {/* Continue Listening / Recently Played */}
          {recommendations.recentlyPlayed.length > 0 && (
            <RecommendationSection
              title="Continue Listening"
              description="Pick up where you left off"
              tracks={recommendations.recentlyPlayed}
            />
          )}

          {/* Your Favorites / Most Played */}
          {recommendations.mostPlayed.length > 0 && (
            <RecommendationSection
              title="Your Favorites"
              description="Tracks you can't get enough of"
              tracks={recommendations.mostPlayed}
            />
          )}

          {/* Top Artists */}
          {recommendations.topArtists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Top Artists</h3>
                <p className="text-sm text-gray-500 mt-0.5">Artists you love most</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {recommendations.topArtists.map((artist, index) => (
                  <ArtistCard key={artist.name} artist={artist} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {recommendations.recentlyPlayed.length === 0 && 
           recommendations.mostPlayed.length === 0 && 
           recommendations.topArtists.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-6 rounded-xl bg-white/5 border border-white/5"
            >
              <Music size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No recommendations yet
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Start listening to build your personalized recommendations
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
