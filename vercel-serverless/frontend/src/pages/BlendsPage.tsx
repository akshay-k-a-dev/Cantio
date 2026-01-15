import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Loader2, Mail, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlend, Blend } from '../lib/blendStore';

export function BlendsPage() {
  const navigate = useNavigate();
  const { blends, loading, fetchBlends, sendInvite } = useBlend();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlends();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSending(true);
    setError('');
    try {
      await sendInvite(inviteEmail.trim());
      setShowInviteModal(false);
      setInviteEmail('');
      alert('Blend invite sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Blends</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Collaborative playlists with friends
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 text-sm md:text-base"
        >
          <Plus size={20} />
          <span className="hidden xs:inline">Create Blend</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && blends.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Blends List */}
      {!loading && blends.length > 0 && (
        <div className="space-y-2">
          {blends.map((blend) => (
            <BlendCard key={blend.id} blend={blend} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && blends.length === 0 && (
        <div className="text-center py-12 sm:py-20 px-4">
          <Users size={48} className="sm:hidden mx-auto mb-4 text-gray-700" />
          <Users size={64} className="hidden sm:block mx-auto mb-4 text-gray-700" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">
            No blends yet
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Create a blend to mix your music with a friend
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:hidden" />
            <Plus size={20} className="hidden sm:block" />
            Create Your First Blend
          </button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-2">Create a Blend</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter the email address of the person you want to blend with
            </p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Friend's Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    autoFocus
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inviteEmail.trim() || sending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface BlendCardProps {
  blend: Blend;
}

function BlendCard({ blend }: BlendCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/blends/${blend.id}`)}
      className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg p-3 sm:p-4 cursor-pointer border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 sm:gap-4"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
        <Users size={24} className="sm:hidden text-white" />
        <Users size={28} className="hidden sm:block text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate text-sm sm:text-base mb-0.5 sm:mb-1">{blend.name}</h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-1">
          {blend._count?.tracks || 0} tracks
        </p>
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-400">
          <span className="truncate max-w-[120px] sm:max-w-[200px]">{blend.user1.name || blend.user1.email}</span>
          <span className="flex-shrink-0">×</span>
          <span className="truncate max-w-[120px] sm:max-w-[200px]">{blend.user2.name || blend.user2.email}</span>
        </div>
      </div>
    </motion.div>
  );
}
