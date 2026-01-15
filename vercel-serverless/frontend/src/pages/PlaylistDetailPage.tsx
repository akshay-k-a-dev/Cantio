import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Play, Trash2, ChevronLeft, Loader2, Heart } from 'lucide-react';
import { usePlaylist, PlaylistTrack } from '../lib/playlistStore';
import { usePlayer } from '../services/player';

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPlaylist, getPlaylist, removeTrackFromPlaylist } = usePlaylist();
  const { play, addToQueue, currentTrack, state, like, unlike, isLiked } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await getPlaylist(id);
    } catch (error) {
      console.error('Failed to load playlist:', error);
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = async () => {
    if (!currentPlaylist?.tracks || currentPlaylist.tracks.length === 0) return;

    // Play first track
    const firstTrack = currentPlaylist.tracks[0];
    await play({
      videoId: firstTrack.trackId,
      title: firstTrack.title,
      artist: firstTrack.artist,
      thumbnail: firstTrack.thumbnail || '',
      duration: firstTrack.duration || 0
    });

    // Add rest to queue
    for (let i = 1; i < currentPlaylist.tracks.length; i++) {
      const track = currentPlaylist.tracks[i];
      await addToQueue({
        videoId: track.trackId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      });
    }
  };

  const handlePlayTrack = async (track: PlaylistTrack, index: number) => {
    if (!currentPlaylist?.tracks) return;

    await play({
      videoId: track.trackId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail || '',
      duration: track.duration || 0
    });

    // Add songs after this one to queue
    for (let i = index + 1; i < currentPlaylist.tracks.length; i++) {
      const t = currentPlaylist.tracks[i];
      await addToQueue({
        videoId: t.trackId,
        title: t.title,
        artist: t.artist,
        thumbnail: t.thumbnail || '',
        duration: t.duration || 0
      });
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!id) return;
    setRemoving(trackId);
    try {
      await removeTrackFromPlaylist(id, trackId);
      await loadPlaylist(); // Reload to get updated list
    } catch (error: any) {
      alert(error.message || 'Failed to remove track');
    } finally {
      setRemoving(null);
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, track: PlaylistTrack) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="text-center py-20">
        <Music size={64} className="mx-auto mb-4 text-gray-700" />
        <h3 className="text-2xl font-bold text-gray-400">Playlist not found</h3>
      </div>
    );
  }

  const tracks = currentPlaylist.tracks || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/playlists')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back to Library</span>
      </button>

      {/* Playlist Header */}
      <div className="flex items-start gap-6">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Music size={80} className="text-white/80" />
        </div>
        <div className="flex-1 pt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Playlist
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{currentPlaylist.name}</h1>
          {currentPlaylist.description && (
            <p className="text-gray-400 mb-4">{currentPlaylist.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold">{currentPlaylist.user?.name || 'You'}</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors shadow-xl"
          >
            <Play size={24} fill="black" className="text-black ml-1" />
          </motion.button>
        </div>
      )}

      {/* Tracks List */}
      {tracks.length > 0 ? (
        <div className="space-y-1">
          {tracks.map((track, index) => {
            const isPlaying = currentTrack?.videoId === track.trackId && state === 'playing';
            const liked = isLiked(track.trackId);

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handlePlayTrack(track, index)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group"
              >
                {/* Index */}
                <div className="w-6 text-center text-gray-400 text-sm">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail || ''}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleLike(e, track)}
                    className={`p-2 rounded-full transition-colors ${liked ? 'text-green-500' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTrack(track.trackId);
                    }}
                    disabled={removing === track.trackId}
                    className="p-2 rounded-full text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {removing === track.trackId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            This playlist is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Search for songs and add them to this playlist
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Search Songs
          </button>
        </div>
      )}
    </div>
  );
}
