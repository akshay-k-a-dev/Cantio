import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link2, Check, Globe, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/authStore';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

interface SharePlaylistProps {
  playlistId: string;
  playlistName: string;
  isPublic: boolean;
  shareSlug?: string | null;
  onUpdate?: (isPublic: boolean, slug: string | null) => void;
}

export default function SharePlaylist({
  playlistId,
  playlistName,
  isPublic,
  shareSlug,
  onUpdate,
}: SharePlaylistProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(shareSlug);
  const [currentPublic, setCurrentPublic] = useState(isPublic);

  const shareUrl = currentSlug
    ? `${window.location.origin}/p/${currentSlug}`
    : null;

  const handleShare = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/playlists/${playlistId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const data = await resp.json();
        setCurrentSlug(data.shareSlug);
        setCurrentPublic(true);
        onUpdate?.(true, data.shareSlug);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/playlists/${playlistId}/share`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        setCurrentSlug(null);
        setCurrentPublic(false);
        onUpdate?.(false, null);
      }
    } catch (err) {
      console.error('Unshare failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({
        title: playlistName,
        text: `Check out "${playlistName}" on Cantio`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-colors ${
          currentPublic
            ? 'text-[#518EAC] hover:text-[#A4C4D4] bg-[#518EAC]/10'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Share playlist"
      >
        <Share2 size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Share Playlist</h3>
                <p className="text-xs text-gray-500 mt-0.5">{playlistName}</p>
              </div>

              <div className="p-3 space-y-3">
                {/* Visibility status */}
                <div className="flex items-center gap-2 text-sm">
                  {currentPublic ? (
                    <>
                      <Globe size={16} className="text-[#518EAC]" />
                      <span className="text-[#518EAC] font-medium">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="text-gray-400" />
                      <span className="text-gray-400">Private</span>
                    </>
                  )}
                </div>

                {/* Share link */}
                {currentPublic && shareUrl && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-xs text-gray-300 truncate select-all">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                      title="Copy link"
                    >
                      {copied ? (
                        <Check size={16} className="text-[#518EAC]" />
                      ) : (
                        <Link2 size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!currentPublic ? (
                    <button
                      onClick={handleShare}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0F4C6C] hover:bg-[#518EAC] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                      Make Public
                    </button>
                  ) : (
                    <>
                      {'share' in navigator && (
                        <button
                          onClick={handleNativeShare}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0F4C6C] hover:bg-[#518EAC] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Share2 size={14} />
                          Share
                        </button>
                      )}
                      <button
                        onClick={handleUnshare}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 text-sm font-medium rounded-lg transition-colors"
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                        Unshare
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
