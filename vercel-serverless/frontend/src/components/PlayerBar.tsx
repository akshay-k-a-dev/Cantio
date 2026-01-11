import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1,
  Heart, ListMusic, Share2, ChevronDown, MoreHorizontal, Plus, Music2
} from 'lucide-react';
import { usePlayer } from '../services/player';
import { useNavigate } from 'react-router-dom';

// Global state for full-screen player visibility
let fullScreenListeners: Set<(val: boolean) => void> = new Set();
let isFullScreenGlobal = false;

export function openFullScreenPlayer() {
  isFullScreenGlobal = true;
  fullScreenListeners.forEach(fn => fn(true));
}

export function closeFullScreenPlayer() {
  isFullScreenGlobal = false;
  fullScreenListeners.forEach(fn => fn(false));
}

// Format time helper
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    state,
    progress,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    next,
    prev,
    like,
    unlike,
    isLiked,
  } = usePlayer();

  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(isFullScreenGlobal);
  const [showOverflow, setShowOverflow] = useState(false);
  const [trackIsLiked, setTrackIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const isPlaying = state === 'playing';

  // Check if track is liked
  useEffect(() => {
    if (currentTrack) {
      setTrackIsLiked(isLiked(currentTrack.videoId));
    }
  }, [currentTrack, isLiked]);

  // Subscribe to global full-screen state
  useEffect(() => {
    const handler = (val: boolean) => setIsFullScreen(val);
    fullScreenListeners.add(handler);
    return () => { fullScreenListeners.delete(handler); };
  }, []);

  // Handle progress bar seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    seek(percent * duration);
  }, [duration, seek]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setVolume(percent);
    if (percent > 0) setIsMuted(false);
  }, [setVolume]);

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleClose = () => {
    closeFullScreenPlayer();
  };

  const handleOpenFull = () => {
    openFullScreenPlayer();
  };

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    if (trackIsLiked) {
      await unlike(currentTrack.videoId);
      setTrackIsLiked(false);
    } else {
      await like(currentTrack);
      setTrackIsLiked(true);
    }
  };

  const openQueue = () => {
    navigate('/queue');
    closeFullScreenPlayer();
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Empty state - no track
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden md:block">
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/5 h-20 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/40">
            <Music2 size={20} />
            <span className="text-sm">Select a track to play</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden md:block">
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/5">
          {/* Progress bar at very top */}
          <div
            ref={progressRef}
            className="h-1 w-full bg-white/10 cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-green-500 group-hover:bg-green-400 relative transition-colors"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="h-[72px] px-4 flex items-center justify-between">
            {/* LEFT: Track Info */}
            <div className="flex items-center gap-3 w-[280px] min-w-0">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-white/50 text-xs truncate">{currentTrack.artist}</p>
              </div>
              <button
                onClick={handleToggleLike}
                className={`p-2 rounded-full hover:bg-white/10 transition flex-shrink-0 ${trackIsLiked ? 'text-green-500' : 'text-white/60'}`}
              >
                <Heart size={18} fill={trackIsLiked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* CENTER: Controls */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-4">
                <button
                  onClick={prev}
                  className="p-2 text-white/60 hover:text-white transition"
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition"
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-black" fill="black" />
                  ) : (
                    <Play size={20} className="text-black ml-0.5" fill="black" />
                  )}
                </button>
                <button
                  onClick={next}
                  className="p-2 text-white/60 hover:text-white transition"
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <span>{formatTime(progress)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* RIGHT: Volume + Queue */}
            <div className="flex items-center gap-3 w-[280px] justify-end">
              <button
                onClick={openQueue}
                className="p-2 text-white/60 hover:text-white transition rounded-full hover:bg-white/10"
              >
                <ListMusic size={18} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className="p-1 text-white/60 hover:text-white transition"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>
                <div
                  ref={volumeRef}
                  className="w-24 h-1 bg-white/20 rounded-full cursor-pointer group"
                  onClick={handleVolumeChange}
                >
                  <div
                    className="h-full bg-white/70 group-hover:bg-green-500 rounded-full relative transition-colors"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MINI PLAYER - sits above the nav bar */}
      <AnimatePresence>
        {!isFullScreen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-14 left-0 right-0 z-50 md:hidden"
          >
            {/* Progress bar */}
            <div className="h-0.5 w-full bg-white/10">
              <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }} />
            </div>

            <div
              className="bg-zinc-900/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3"
              onClick={handleOpenFull}
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-white/50 text-xs truncate">{currentTrack.artist}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={22} className="text-black" fill="black" />
                ) : (
                  <Play size={22} className="text-black ml-0.5" fill="black" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN MOBILE PLAYER */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[999] md:hidden flex flex-col"
            style={{
              background: `linear-gradient(180deg, rgba(30, 30, 30, 0.98) 0%, rgba(10, 10, 10, 0.99) 100%)`,
            }}
          >
            {/* Background blur with album art */}
            <div
              className="absolute inset-0 opacity-30 blur-3xl scale-110"
              style={{
                backgroundImage: `url(${currentTrack.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 pt-safe">
                <button
                  onClick={handleClose}
                  className="p-2 -ml-2 text-white/70 hover:text-white active:scale-95 transition"
                >
                  <ChevronDown size={28} />
                </button>
                <div className="text-center">
                  <p className="text-white/50 text-xs uppercase tracking-wider">Playing from</p>
                  <p className="text-white text-sm font-medium">Your Library</p>
                </div>
                <button
                  onClick={() => setShowOverflow(!showOverflow)}
                  className="p-2 -mr-2 text-white/70 hover:text-white active:scale-95 transition"
                >
                  <MoreHorizontal size={24} />
                </button>
              </div>

              {/* Album Art */}
              <div className="flex-1 flex items-center justify-center px-8 py-6">
                <motion.img
                  key={currentTrack.videoId}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full max-w-[340px] aspect-square rounded-xl object-cover shadow-2xl"
                />
              </div>

              {/* Track Info + Like */}
              <div className="px-8 flex items-start justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-white text-xl font-bold truncate">{currentTrack.title}</h2>
                  <p className="text-white/60 text-base mt-1 truncate">{currentTrack.artist}</p>
                </div>
                <button
                  onClick={handleToggleLike}
                  className={`p-2 -mr-2 transition active:scale-95 ${trackIsLiked ? 'text-green-500' : 'text-white/50'}`}
                >
                  <Heart size={26} fill={trackIsLiked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-8 mt-6">
                <div
                  className="h-1 w-full bg-white/20 rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-white rounded-full relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/50">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-8 px-8 mt-6">
                <button
                  onClick={prev}
                  className="p-3 text-white active:scale-95 transition"
                >
                  <SkipBack size={32} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center active:scale-95 transition shadow-lg"
                >
                  {isPlaying ? (
                    <Pause size={32} className="text-black" fill="black" />
                  ) : (
                    <Play size={32} className="text-black ml-1" fill="black" />
                  )}
                </button>
                <button
                  onClick={next}
                  className="p-3 text-white active:scale-95 transition"
                >
                  <SkipForward size={32} fill="currentColor" />
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between px-8 mt-8 mb-8 pb-safe">
                <button className="p-3 text-white/50 active:scale-95 transition">
                  <Share2 size={22} />
                </button>
                <button
                  onClick={openQueue}
                  className="p-3 text-white/50 active:scale-95 transition"
                >
                  <ListMusic size={22} />
                </button>
              </div>
            </div>

            {/* Overflow Menu */}
            <AnimatePresence>
              {showOverflow && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 z-20"
                    onClick={() => setShowOverflow(false)}
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl z-30 pb-safe"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3" />
                    <div className="p-4">
                      <button className="flex items-center gap-4 w-full p-4 hover:bg-white/5 rounded-xl transition">
                        <Plus size={22} className="text-white/70" />
                        <span className="text-white">Add to Playlist</span>
                      </button>
                      <button className="flex items-center gap-4 w-full p-4 hover:bg-white/5 rounded-xl transition">
                        <Share2 size={22} className="text-white/70" />
                        <span className="text-white">Share</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
