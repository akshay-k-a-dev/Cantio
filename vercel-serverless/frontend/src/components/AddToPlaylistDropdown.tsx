import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListPlus, Loader2 } from 'lucide-react';
import { usePlaylist } from '../lib/playlistStore';
import { Track } from '../lib/cache';

interface AddToPlaylistDropdownProps {
  track: Track;
  onAddToQueue: () => void;
}

export function AddToPlaylistDropdown({ track, onAddToQueue }: AddToPlaylistDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { playlists, loading, createPlaylist, addTrackToPlaylist, fetchPlaylists } = usePlaylist();

  // Force fetch playlists when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaylists(true); // Force fresh fetch when opened
    }
  }, [isOpen, fetchPlaylists]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCreateModal(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAddToPlaylist = async (playlistId: string) => {
    setAdding(playlistId);
    try {
      await addTrackToPlaylist(playlistId, {
        trackId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
        duration: track.duration
      });
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to add track to playlist');
    } finally {
      setAdding(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      const playlist = await createPlaylist(newPlaylistName.trim());
      await addTrackToPlaylist(playlist.id, {
        trackId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
        duration: track.duration
      });
      setShowCreateModal(false);
      setNewPlaylistName('');
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const canCreateMore = playlists.length < 15;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full text-gray-400 hover:text-white transition-colors active:scale-95"
        title="Add to playlist"
      >
        <Plus size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 w-56 sm:w-64 max-h-[70vh] bg-zinc-900 rounded-lg shadow-xl border border-white/10 overflow-hidden z-[100]"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {!showCreateModal ? (
              <div className="py-1">
                {/* Add to Queue */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Plus size={16} />
                  <span>Add to Queue</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* Loading State */}
                {loading && playlists.length === 0 && (
                  <div className="px-4 py-3 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading playlists...</span>
                  </div>
                )}

                {/* User's Playlists */}
                {!loading && playlists.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase">
                      Add to playlist
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {playlists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPlaylist(playlist.id);
                          }}
                          disabled={adding === playlist.id}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between disabled:opacity-50"
                        >
                          <span className="truncate">{playlist.name}</span>
                          {adding === playlist.id && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                  </>
                )}

                {/* No playlists message */}
                {!loading && playlists.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-500 text-center">
                    No playlists yet
                  </div>
                )}

                {/* Create New Playlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canCreateMore) {
                      setShowCreateModal(true);
                    } else {
                      alert('Maximum 15 playlists allowed');
                    }
                  }}
                  disabled={!canCreateMore}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ListPlus size={16} />
                  <span>Create Playlist</span>
                  {!canCreateMore && (
                    <span className="text-xs text-gray-500 ml-auto">(15/15)</span>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAndAdd} className="p-4">
                <h3 className="text-sm font-semibold mb-3">Create New Playlist</h3>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  autoFocus
                  maxLength={50}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(false);
                      setNewPlaylistName('');
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim() || creating}
                    className="flex-1 px-3 py-2 text-sm bg-white text-black hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
