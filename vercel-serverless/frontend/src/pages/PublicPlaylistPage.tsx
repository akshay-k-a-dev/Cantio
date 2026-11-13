import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Play, ChevronLeft, Loader2, Share2, Library, Check } from 'lucide-react';
import { usePlaylist, Playlist, PlaylistTrack } from '../lib/playlistStore';
import { usePlayer } from '../services/player';
import { useAuth } from '../lib/authStore';

export function PublicPlaylistPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const playlistIdentifier = slug || id;
  const navigate = useNavigate();
  const { getPublicPlaylist, createPlaylist, addTracksToPlaylist, fetchPlaylists } = usePlaylist();
  const { play, replaceQueue, currentTrack, state } = usePlayer();
  const { user, isAuthenticated } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (playlistIdentifier) {
      loadPlaylist();
    } else {
      setError('Invalid public playlist link');
      setLoading(false);
    }
  }, [playlistIdentifier]);

  const loadPlaylist = async () => {
    if (!playlistIdentifier) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicPlaylist(playlistIdentifier);
      setPlaylist(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const isMyPlaylist = playlist && user && playlist.userId === user.id;

  const handleShare = async () => {
    if (!playlist) return;
    const url = playlist.shareSlug
      ? `${window.location.origin}/p/${playlist.shareSlug}`
      : `${window.location.origin}/public/playlist/${playlist.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: playlist.name,
          text: `Listen to "${playlist.name}" on Cantio`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  const handleSaveToLibrary = async () => {
    if (!playlist?.tracks || playlist.tracks.length === 0 || !isAuthenticated) return;
    setSaving(true);
    try {
      // Create a new playlist with the same name
      const newPlaylist = await createPlaylist(playlist.name, playlist.description || undefined);

      // Bulk-add all tracks to the new playlist
      // Note: duration must be positive or undefined per backend schema
      const tracksToAdd = playlist.tracks.map(t => ({
        trackId: t.trackId,
        title: t.title,
        artist: t.artist || 'Unknown Artist',
        thumbnail: t.thumbnail || undefined,
        duration: (t.duration && t.duration > 0) ? t.duration : undefined,
      }));

      try {
        await addTracksToPlaylist(newPlaylist.id, tracksToAdd);
      } catch (bulkErr) {
        console.warn('Bulk add had issues, playlist created but some tracks may be missing:', bulkErr);
      }

      // Refresh playlists list to get the real server state
      await fetchPlaylists(true);

      setSaved(true);
      console.log('✅ Playlist saved to library:', newPlaylist.id);

      // Reset saved state after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save playlist to library:', err);
      alert(err.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const handlePlayAll = async () => {
    if (!playlist?.tracks || playlist.tracks.length === 0) return;
    const [first, ...rest] = playlist.tracks;
    await play({
      videoId: first.trackId,
      title: first.title,
      artist: first.artist,
      thumbnail: first.thumbnail || '',
      duration: first.duration || 0
    });
    await replaceQueue(
      rest.map(track => ({
        videoId: track.trackId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      })),
      `public:${playlist.id}`
    );
  };

  const handlePlayTrack = async (track: PlaylistTrack, index: number) => {
    if (!playlist?.tracks) return;
    await play({
      videoId: track.trackId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail || '',
      duration: track.duration || 0
    });
    const remainder = playlist.tracks.slice(index + 1).map(t => ({
      videoId: t.trackId,
      title: t.title,
      artist: t.artist,
      thumbnail: t.thumbnail || '',
      duration: t.duration || 0
    }));
    await replaceQueue(remainder, `public:${playlist.id}:${track.trackId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="text-center py-20">
        <Music size={64} className="mx-auto mb-4 text-gray-700" />
        <h3 className="text-2xl font-bold text-gray-400">Playlist not available</h3>
        {error && <p className="text-gray-500 mt-2">{error}</p>}
      </div>
    );
  }

  const tracks = playlist.tracks || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/search')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      <div className="flex items-start gap-6">
        <div className="w-48 h-48 bg-gradient-to-br from-[#518EAC] to-[#0F4C6C] rounded-2xl flex items-center justify-center flex-shrink-0">
          <Music size={80} className="text-white/80" />
        </div>
        <div className="flex-1 pt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Public Playlist
          </p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-400 mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold">{playlist.user?.name || playlist.user?.username || 'Creator'}</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {tracks.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAll}
                className="w-14 h-14 bg-[#518EAC] rounded-full flex items-center justify-center hover:bg-[#619CA9] transition-colors shadow-xl"
              >
                <Play size={24} fill="black" className="text-black ml-1" />
              </motion.button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>

            {/* Save to Library — shown only for logged-in users viewing someone else's playlist */}
            {isAuthenticated && !isMyPlaylist && tracks.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveToLibrary}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  saved
                    ? 'bg-[#518EAC]/20 text-[#A4C4D4] border border-[#518EAC]/30'
                    : 'bg-[#0F4C6C] hover:bg-[#518EAC] text-white'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check size={16} />
                    Saved to Library
                  </>
                ) : (
                  <>
                    <Library size={16} />
                    Save to Library
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {tracks.length > 0 ? (
        <div className="space-y-1">
          {tracks.map((track, index) => {
            const isPlaying = currentTrack?.videoId === track.trackId && state === 'playing';
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handlePlayTrack(track, index)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group"
              >
                <div className="w-6 text-center text-gray-400 text-sm">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse" />
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-[#518EAC] animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <img
                  src={track.thumbnail || ''}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#518EAC]' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-2xl font-bold text-gray-400">No tracks yet</h3>
        </div>
      )}
    </div>
  );
}
