import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Check } from 'lucide-react';
import { useBlend } from '../lib/blendStore';
import { useNavigate } from 'react-router-dom';

export function BlendInviteNotifications() {
  const { invites, fetchInvites, acceptInvite, rejectInvite } = useBlend();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch invites on mount
    fetchInvites();

    // Poll for new invites every 60 seconds (reduced from 30s)
    const interval = setInterval(() => {
      fetchInvites();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchInvites]);

  const handleAccept = async (id: string) => {
    try {
      const blend = await acceptInvite(id);
      if (blend) {
        navigate(`/blends/${blend.id}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to accept invite');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectInvite(id);
    } catch (error: any) {
      console.error('Failed to reject invite:', error);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-2 left-2 sm:left-auto sm:right-4 md:right-6 z-50 space-y-2 sm:max-w-sm">
      <AnimatePresence>
        {invites.map((invite) => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={16} className="sm:hidden text-white" />
                <Users size={20} className="hidden sm:block text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">
                  Blend Invitation
                </p>
                <p className="text-[10px] sm:text-xs text-white/90 line-clamp-2">
                  {invite.sender.name || invite.sender.email} wants to create a blend with you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              <button
                onClick={() => handleAccept(invite.id)}
                className="flex-1 py-1.5 sm:py-2 bg-white hover:bg-white/90 text-purple-600 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-colors"
              >
                <Check size={14} className="sm:hidden" />
                <Check size={16} className="hidden sm:block" />
                Accept
              </button>
              <button
                onClick={() => handleReject(invite.id)}
                className="flex-1 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-colors"
              >
                <X size={16} />
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
