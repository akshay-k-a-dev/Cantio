import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Play, ChevronLeft, RefreshCw, Loader2, Heart, LogOut, X } from 'lucide-react';
import { useBlend, BlendTrack } from '../lib/blendStore';
import { usePlayer } from '../services/player';
import { useAuth } from '../lib/authStore';

export function BlendDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBlend, getBlend, regenerateBlend, leaveBlend } = useBlend();
  const { play, addToQueue, currentTrack, state, like, unlike, isLiked } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadBlend();
    }
  }, [id]);

  const loadBlend = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await getBlend(id);
    } catch (error) {
      console.error('Failed to load blend:', error);
      navigate('/blends');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    setRegenerating(true);
    try {
      await regenerateBlend(id);
    } catch (error: any) {
      alert(error.message || 'Failed to regenerate blend');
    } finally {
      setRegenerating(false);
    }
  };

  const handleLeaveBlend = async () => {
    if (!id) return;
    setLeaving(true);
    try {
      await leaveBlend(id);
      navigate('/blends');
    } catch (error: any) {
      alert(error.message || 'Failed to leave blend');
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const handlePlayAll = async () => {
    if (!currentBlend?.tracks || currentBlend.tracks.length === 0) return;

    const firstTrack = currentBlend.tracks[0];
    await play({
      videoId: firstTrack.trackId,
      title: firstTrack.title,
      artist: firstTrack.artist,
      thumbnail: firstTrack.thumbnail || '',
      duration: firstTrack.duration || 0
    });

    for (let i = 1; i < currentBlend.tracks.length; i++) {
      const track = currentBlend.tracks[i];
      await addToQueue({
        videoId: track.trackId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      });
    }
  };

  const handlePlayTrack = async (track: BlendTrack, index: number) => {
    if (!currentBlend?.tracks) return;

    await play({
      videoId: track.trackId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail || '',
      duration: track.duration || 0
    });

    for (let i = index + 1; i < currentBlend.tracks.length; i++) {
      const t = currentBlend.tracks[i];
      await addToQueue({
        videoId: t.trackId,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail || '',
        duration: t.duration || 0
      });
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, track: BlendTrack) => {
    e.stopPropagation();
    if (isLiked(track.trackId)) {
      await unlike(track.trackId);
    } else {
      await like({
        videoId: track.trackId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      });
    }
  };

  const getUserName = (userId: string) => {
    if (!currentBlend) return '';
    if (userId === currentBlend.user1Id) {
      return currentBlend.user1.name || currentBlend.user1.email.split('@')[0];
    }
    return currentBlend.user2.name || currentBlend.user2.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!currentBlend) {
    return (
      <div className="text-center py-20">
        <Users size={64} className="mx-auto mb-4 text-gray-700" />
        <h3 className="text-2xl font-bold text-gray-400">Blend not found</h3>
      </div>
    );
  }

  const tracks = currentBlend.tracks || [];
  const otherUser = user?.id === currentBlend.user1Id ? currentBlend.user2 : currentBlend.user1;

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-1 md:px-0">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blends')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base"
      >
        <ChevronLeft size={18} />
        <span>Back to Blends</span>
      </button>

      {/* Blend Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Users size={48} className="sm:hidden text-white/80" />
          <Users size={64} className="hidden sm:block md:hidden text-white/80" />
          <Users size={80} className="hidden md:block text-white/80" />
        </div>
        <div className="flex-1 pt-0 sm:pt-4">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-400 mb-1 sm:mb-2">
            Blend
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 sm:mb-4">{currentBlend.name}</h1>
          <p className="text-gray-400 text-sm sm:text-base mb-2 sm:mb-4">
            With <span className="text-white font-medium">{otherUser.name || otherUser.email}</span>
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-400">
            <span>{tracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Actions - Mobile Optimized */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
        {tracks.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-xl"
          >
            <Play size={20} fill="white" className="text-white ml-1" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-3 py-2 sm:px-4 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
        >
          <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
          <span className="hidden xs:inline">Refresh</span>
          <span className="xs:hidden">Refresh</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLeaveModal(true)}
          className="px-3 py-2 sm:px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm"
        >
          <LogOut size={16} />
          <span className="hidden xs:inline">Leave Blend</span>
          <span className="xs:hidden">Leave</span>
        </motion.button>
      </div>

      {/* Tracks List */}
      {tracks.length > 0 ? (
        <div className="space-y-1">
          {tracks.map((track, index) => {
            const isPlaying = currentTrack?.videoId === track.trackId && state === 'playing';
            const liked = isLiked(track.trackId);
            const fromUser = getUserName(track.sourceUserId);
            const isFromCurrentUser = track.sourceUserId === user?.id;

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handlePlayTrack(track, index)}
                className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group"
              >
                {/* Index */}
                <div className="w-5 sm:w-6 text-center text-gray-400 text-xs sm:text-sm flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      <div className="w-0.5 h-3 bg-purple-500 animate-pulse" />
                      <div className="w-0.5 h-3 bg-purple-500 animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-purple-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail || ''}
                  alt={track.title}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover flex-shrink-0"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-medium truncate ${isPlaying ? 'text-purple-500' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[100px] sm:max-w-none">
                      {track.artist}
                    </p>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <p className={`text-[10px] sm:text-xs ${isFromCurrentUser ? 'text-purple-400' : 'text-pink-400'}`}>
                      {isFromCurrentUser ? 'You' : fromUser}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleLike(e, track)}
                    className={`p-1.5 sm:p-2 rounded-full transition-colors ${liked ? 'text-purple-500' : 'text-gray-400 sm:opacity-0 sm:group-hover:opacity-100'}`}
                  >
                    <Heart size={14} className="sm:hidden" fill={liked ? 'currentColor' : 'none'} />
                    <Heart size={16} className="hidden sm:block" fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20">
          <Users size={48} className="sm:hidden mx-auto mb-4 text-gray-700" />
          <Users size={64} className="hidden sm:block mx-auto mb-4 text-gray-700" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
            No tracks yet
          </h3>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            Both users need some listening history to generate a blend
          </p>
        </div>
      )}

      {/* Leave Blend Modal */}
      {showLeaveModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowLeaveModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-400">Leave Blend</h2>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to leave this blend? This will permanently delete the blend for both you and {otherUser.name || otherUser.email}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveBlend}
                disabled={leaving}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Leaving...
                  </>
                ) : (
                  'Leave Blend'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
