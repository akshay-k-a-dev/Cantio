import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  Heart,
  BookmarkPlus,
  Check,
  Loader2,
  Music,
  X
} from 'lucide-react';
import { usePlayer } from '../services/player';
import { usePlaylist } from '../lib/playlistStore';
import { AddToPlaylistDropdown } from '../components/AddToPlaylistDropdown';
import { Track } from '../lib/cache';

type ContentType = 'playlist' | 'album' | 'artist';

interface ContentMeta {
  title: string;
  subtitle: string;
  thumbnail: string;
  extra?: string; // year / subscribers
}

export function YTMusicDetailPage() {
  const { type, id } = useParams<{ type: ContentType; id: string }>();
  const navigate = useNavigate();

  const [meta, setMeta] = useState<ContentMeta | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save-to-library state
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedPlaylistId, setSavedPlaylistId] = useState<string | null>(null);

  const { play, addToQueue, currentTrack, state: playerState, like, unlike, isLiked } = usePlayer();
  const { createPlaylist, addTracksToPlaylist, fetchPlaylists } = usePlaylist();

  useEffect(() => {
    if (type && id) loadContent();
  }, [type, id]);

  const loadContent = async () => {
    if (!type || !id) return;
    setLoading(true);
    setError(null);
    try {
      if (type === 'playlist') {
        const result = await usePlayer.getState().getYTMusicPlaylistTracks(id);
        setTracks(result);
        setMeta({ title: 'YT Music Playlist', subtitle: 'Playlist', thumbnail: result[0]?.thumbnail || '' });
      } else if (type === 'album') {
        const result = await usePlayer.getState().getYTMusicAlbumTracks(id);
        setTracks(result.tracks);
        setMeta({ title: result.title, subtitle: result.artist, thumbnail: result.thumbnail, extra: result.year });
      } else if (type === 'artist') {
        const result = await usePlayer.getState().getYTMusicArtistTopTracks(id);
        setTracks(result.tracks);
        setMeta({ title: result.name, subtitle: 'Artist', thumbnail: result.thumbnail, extra: result.subscribers });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = async () => {
    if (tracks.length === 0) return;
    await play(tracks[0]);
    for (let i = 1; i < tracks.length; i++) await addToQueue(tracks[i]);
  };

  const handlePlayTrack = async (track: Track, index: number) => {
    await play(track);
    for (let i = index + 1; i < tracks.length; i++) await addToQueue(tracks[i]);
  };

  const handleToggleLike = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (isLiked(track.videoId)) await unlike(track.videoId);
    else await like(track);
  };

  const handleAddToQueue = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    await addToQueue(track);
  };

  const openSaveModal = () => {
    setSaveName(meta?.title || 'Saved Playlist');
    setSaveError(null);
    setSavedPlaylistId(null);
    setSaveOpen(true);
  };

  const handleSave = async () => {
    if (!saveName.trim() || tracks.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const playlist = await createPlaylist(saveName.trim(), `Saved from YouTube Music`, false);
      if (tracks.length > 0) {
        await addTracksToPlaylist(playlist.id, tracks.map(t => ({
          trackId: t.videoId,
          title: t.title,
          artist: t.artist,
          thumbnail: t.thumbnail,
          duration: t.duration
        })));
      }
      await fetchPlaylists(true);
      setSavedPlaylistId(playlist.id);
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = type === 'playlist' ? 'Playlist' : type === 'album' ? 'Album' : 'Artist';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /><span>Back</span>
        </button>
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">Could not load content</h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ChevronLeft size={20} /><span>Back to Search</span>
      </button>

      {/* Header */}
      {meta && (
        <div className="flex items-start gap-6">
          {/* Thumbnail */}
          <div className={`w-40 h-40 md:w-48 md:h-48 flex-shrink-0 overflow-hidden ${type === 'artist' ? 'rounded-full' : 'rounded-2xl'} bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
            {meta.thumbnail ? (
              <img
                src={meta.thumbnail}
                alt={meta.title}
                className={`w-full h-full object-cover ${type === 'artist' ? 'rounded-full' : 'rounded-2xl'}`}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <Music size={72} className="text-white/70" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">{typeLabel}</p>
            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{meta.title}</h1>
            <p className="text-gray-400 mb-1">{meta.subtitle}</p>
            {meta.extra && <p className="text-sm text-gray-500 mb-2">{meta.extra}</p>}
            <p className="text-sm text-gray-400">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors shadow-xl"
          >
            <Play size={24} fill="black" className="text-black ml-1" />
          </motion.button>

          {savedPlaylistId ? (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={() => navigate(`/playlist/${savedPlaylistId}`)}
              className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/40 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-green-500/30 transition-colors"
            >
              <Check size={16} />
              Saved — View Playlist
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openSaveModal}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
            >
              <BookmarkPlus size={16} />
              Save to Library
            </motion.button>
          )}
        </div>
      )}

      {/* Track List */}
      {tracks.length > 0 && (
        <div className="space-y-1">
          {tracks.map((track, index) => {
            const isPlaying = currentTrack?.videoId === track.videoId && playerState === 'playing';
            const liked = isLiked(track.videoId);

            return (
              <motion.div
                key={`${track.videoId}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.025 }}
                onClick={() => handlePlayTrack(track, index)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer group"
              >
                {/* Index / equaliser */}
                <div className="w-6 text-center text-gray-400 text-sm flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-center justify-center">
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-75" />
                      <div className="w-0.5 h-3 bg-green-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span className="group-hover:hidden">{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail || ''}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                </div>

                {/* Duration */}
                {track.duration > 0 && (
                  <span className="text-xs text-gray-500 flex-shrink-0 hidden md:block">
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleLike(e, track)}
                    className={`p-2 rounded-full transition-colors ${liked ? 'text-green-500' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
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
      )}

      {/* Empty state */}
      {tracks.length === 0 && !loading && (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-2xl font-bold text-gray-400">No tracks found</h3>
          <p className="text-gray-500 text-sm mt-2">This content may require a YouTube Music account or may not be available.</p>
        </div>
      )}

      {/* Save to Library Modal */}
      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !saving && setSaveOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Save to Library</h2>
                <button onClick={() => !saving && setSaveOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-400">
                {tracks.length} tracks will be saved as a new playlist.
              </p>

              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Playlist name"
                disabled={saving}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              />

              {saveError && (
                <p className="text-sm text-red-400">{saveError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => !saving && setSaveOpen(false)}
                  disabled={saving}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !saveName.trim()}
                  className="flex-1 bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving…</>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
