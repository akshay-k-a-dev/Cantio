import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, X, Clock, Check } from 'lucide-react';
import { useSleepTimer } from '../lib/sleepTimer';

const PRESETS = [
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '2 hours', seconds: 120 * 60 },
] as const;

function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SleepTimerButton() {
  const [open, setOpen] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const { isActive, mode, remaining, startTimer, setEndOfSong, cancel } = useSleepTimer();

  const handlePreset = (seconds: number) => {
    startTimer(seconds);
    setOpen(false);
  };

  const handleEndOfSong = () => {
    setEndOfSong();
    setOpen(false);
  };

  const handleCustom = () => {
    const mins = parseInt(customMin, 10);
    if (mins > 0 && mins <= 720) {
      startTimer(mins * 60);
      setCustomMin('');
      setOpen(false);
    }
  };

  const handleCancel = () => {
    cancel();
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-colors relative ${
          isActive
            ? 'text-[#518EAC] hover:text-[#A4C4D4] bg-[#518EAC]/10'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title={isActive ? `Sleep timer: ${mode === 'end_of_song' ? 'end of song' : formatRemaining(remaining)}` : 'Sleep timer'}
      >
        <Moon size={18} />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#518EAC] rounded-full" />
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#518EAC]" />
                  <span className="text-sm font-semibold text-white">Sleep Timer</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Active timer status */}
              {isActive && (
                <div className="px-4 py-3 bg-[#518EAC]/10 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#518EAC] font-medium">Timer active</p>
                      <p className="text-lg font-bold text-white">
                        {mode === 'end_of_song' ? 'End of song' : formatRemaining(remaining)}
                      </p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Presets */}
              <div className="p-2 space-y-0.5">
                {PRESETS.map(({ label, seconds }) => (
                  <button
                    key={label}
                    onClick={() => handlePreset(seconds)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                  >
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
                    {isActive && mode === 'duration' && Math.abs(remaining - seconds) < 5 && (
                      <Check size={14} className="text-[#518EAC]" />
                    )}
                  </button>
                ))}

                {/* End of song */}
                <button
                  onClick={handleEndOfSong}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">End of current song</span>
                  {isActive && mode === 'end_of_song' && (
                    <Check size={14} className="text-[#518EAC]" />
                  )}
                </button>

                {/* Custom timer */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    placeholder="Custom (min)"
                    className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#518EAC]/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
                  />
                  <button
                    onClick={handleCustom}
                    disabled={!customMin || parseInt(customMin) <= 0}
                    className="px-3 py-2 text-sm font-medium bg-[#0F4C6C] hover:bg-[#518EAC] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
