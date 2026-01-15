import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music2, AlignLeft, Clock } from 'lucide-react';
import { getLyrics, parseSyncedLyrics, getCurrentLineIndex, getRandomNoLyricsMessage, noSyncedLyricsMessage, LyricsData, SyncedLine } from '../services/lyrics';

interface LyricsPanelProps {
  trackTitle: string;
  artistName: string;
  duration: number;
  currentTime: number;
}

export function LyricsPanel({ trackTitle, artistName, duration, currentTime }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncedLines, setSyncedLines] = useState<SyncedLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<'synced' | 'plain'>('synced');
  const [noLyricsMessage] = useState(getRandomNoLyricsMessage());
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics when track changes
  useEffect(() => {
    let mounted = true;

    async function fetchLyrics() {
      // Wait for valid duration before fetching
      if (!trackTitle || !artistName || !duration || duration <= 0) {
        console.log('📝 Lyrics: Waiting for valid data...', { trackTitle, artistName, duration });
        return;
      }

      console.log('📝 Lyrics: Fetching for', trackTitle, 'by', artistName);
      setLoading(true);
      setLyrics(null);
      setSyncedLines([]);
      setCurrentLineIndex(-1);

      const result = await getLyrics(trackTitle, artistName, duration);
      console.log('📝 Lyrics: Got result', result ? 'Found!' : 'Not found', result);
      
      if (mounted) {
        setLyrics(result);
        if (result?.syncedLyrics) {
          const parsed = parseSyncedLyrics(result.syncedLyrics);
          console.log('📝 Lyrics: Parsed', parsed.length, 'synced lines');
          setSyncedLines(parsed);
          setViewMode('synced');
        } else if (result?.plainLyrics) {
          console.log('📝 Lyrics: Using plain lyrics');
          setViewMode('plain');
        }
        setLoading(false);
      }
    }

    fetchLyrics();

    return () => {
      mounted = false;
    };
  }, [trackTitle, artistName, duration]);

  // Update current line based on playback time
  useEffect(() => {
    if (syncedLines.length > 0 && viewMode === 'synced') {
      const index = getCurrentLineIndex(syncedLines, currentTime);
      setCurrentLineIndex(index);
    }
  }, [currentTime, syncedLines, viewMode]);

  // Auto-scroll to current line - more aggressive approach
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsContainerRef.current && viewMode === 'synced') {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        const container = lyricsContainerRef.current;
        const currentElement = currentLineRef.current;
        
        if (container && currentElement) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();
          
          // Calculate the scroll position to center the current line
          const containerMiddle = containerRect.height / 2;
          const elementMiddle = elementRect.height / 2;
          const scrollOffset = elementRect.top - containerRect.top - containerMiddle + elementMiddle;
          
          // Smooth scroll to position
          container.scrollBy({
            top: scrollOffset,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [currentLineIndex, viewMode]);

  // Loading state - also show when waiting for duration
  if (loading || (!lyrics && duration <= 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-white/60">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-sm">Loading lyrics...</p>
      </div>
    );
  }

  // No lyrics found
  if (!lyrics || (lyrics.instrumental && !lyrics.plainLyrics && !lyrics.syncedLyrics)) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-white/60 px-4 text-center">
        <Music2 size={48} className="mb-4 text-white/40" />
        <p className="text-base sm:text-lg font-medium mb-2">{noLyricsMessage}</p>
        <p className="text-xs sm:text-sm text-white/40">
          {lyrics?.instrumental ? 'This track is marked as instrumental' : 'Try another track!'}
        </p>
      </div>
    );
  }

  // Has plain lyrics but no synced
  if (!lyrics.syncedLyrics && lyrics.plainLyrics) {
    return (
      <div className="h-full overflow-y-auto px-4 sm:px-6 py-6" ref={lyricsContainerRef}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-yellow-400/80 text-xs sm:text-sm">
            <AlignLeft size={16} />
            <p>{noSyncedLyricsMessage}</p>
          </div>
          <div className="whitespace-pre-wrap text-white/80 text-sm sm:text-base leading-relaxed">
            {lyrics.plainLyrics}
          </div>
        </div>
      </div>
    );
  }

  // Has synced lyrics
  if (lyrics.syncedLyrics && syncedLines.length > 0) {
    return (
      <div className="h-full flex flex-col">
        {/* View Mode Toggle */}
        {lyrics.plainLyrics && (
          <div className="flex items-center justify-center gap-2 py-3 border-b border-white/10">
            <button
              onClick={() => setViewMode('synced')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'synced'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Clock size={14} />
              Synced
            </button>
            <button
              onClick={() => setViewMode('plain')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'plain'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <AlignLeft size={14} />
              Plain
            </button>
          </div>
        )}

        {/* Lyrics Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth" ref={lyricsContainerRef}>
          {viewMode === 'synced' ? (
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 py-[40vh]">
              {syncedLines.map((line, index) => (
                <div
                  key={index}
                  ref={index === currentLineIndex ? currentLineRef : null}
                  className={`text-center transition-all duration-500 ease-out ${
                    index === currentLineIndex
                      ? 'text-white text-xl sm:text-2xl md:text-3xl font-bold scale-110 opacity-100'
                      : index < currentLineIndex
                      ? 'text-white/30 text-sm sm:text-base opacity-50'
                      : 'text-white/60 text-base sm:text-lg opacity-70'
                  }`}
                >
                  {line.text || '♪'}
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto whitespace-pre-wrap text-white/80 text-sm sm:text-base leading-relaxed">
              {lyrics.plainLyrics}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
