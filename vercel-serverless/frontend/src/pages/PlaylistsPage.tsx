import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, Trash2, Edit2, Play, MoreVertical, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlaylist, Playlist } from '../lib/playlistStore';
import { usePlayer } from '../services/player';

export function PlaylistsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlists, loading, fetchPlaylists, createPlaylist, deletePlaylist } = usePlaylist();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Force fetch on mount to always get fresh data
  useEffect(() => {
    fetchPlaylists(true);
  }, []); 

  // Refresh when navigating back or regaining focus (but use cache)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchPlaylists(); // Will use cache if recent
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchPlaylists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      const playlist = await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim() || undefined);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      navigate(`/playlist/${playlist.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlaylist(id);
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete playlist');
    }
  };

  const canCreateMore = playlists.length < 15;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Your Library</h1>
          <p className="text-gray-400 text-sm md:text-base">
            {playlists.length} of 15 playlists
          </p>
        </div>
        <button
          onClick={() => canCreateMore && setShowCreateModal(true)}
          disabled={!canCreateMore}
          className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          <Plus size={20} />
          <span className="hidden xs:inline">New Playlist</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && playlists.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Playlists List */}
      {!loading && playlists.length > 0 && (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onDelete={() => setDeleteConfirm(playlist.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && playlists.length === 0 && (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            No playlists yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first playlist to organize your music
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Playlist
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  autoFocus
                  maxLength={50}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                    setNewPlaylistDesc('');
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || creating}
                  className="flex-1 px-4 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm"
          >
            <h2 className="text-xl font-bold mb-2">Delete Playlist?</h2>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. All tracks will be removed from this playlist.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: () => void;
}

function PlaylistCard({ playlist, onDelete }: PlaylistCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all group cursor-pointer relative flex items-center gap-3 sm:gap-4"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Music size={28} className="sm:hidden text-white/80" />
        <Music size={32} className="hidden sm:block text-white/80" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate mb-0.5 sm:mb-1 text-sm sm:text-base">{playlist.name}</h3>
        <p className="text-xs sm:text-sm text-gray-400">
          {playlist._count?.tracks || 0} {playlist._count?.tracks === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-2 rounded-full hover:bg-white/10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <MoreVertical size={18} className="sm:hidden" />
        <MoreVertical size={20} className="hidden sm:block" />
      </button>

      {/* Menu */}
      {showMenu && (
        <div
          className="absolute top-12 right-2 bg-zinc-900 rounded-lg shadow-xl border border-white/10 overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3 text-red-400"
          >
            <Trash2 size={14} />
            Delete Playlist
          </button>
        </div>
      )}
    </motion.div>
  );
}
