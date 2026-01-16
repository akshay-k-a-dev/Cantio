import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { Loader2, Music2, AlignLeft, Clock } from 'lucide-react';
import { getLyrics, getCurrentLineIndex, getRandomNoLyricsMessage, noSyncedLyricsMessage, SyncedLine } from '../services/lyrics';
import { useLyricsStore } from '../lib/lyricsStore';

interface LyricsPanelProps {
  trackTitle: string;
  artistName: string;
  duration: number;
  currentTime: number;
  trackId?: string;
}

// Memoized individual lyric line - Spotify-style for desktop, original for mobile
const LyricLine = memo(({ 
  line, 
  isCurrent, 
  isPast,
  isDesktop,
  distanceFromCurrent,
  lineRef,
}: { 
  line: SyncedLine; 
  isCurrent: boolean; 
  isPast: boolean;
  isDesktop: boolean;
  distanceFromCurrent: number;
  lineRef?: React.RefObject<HTMLDivElement>;
}) => {
  // Desktop: Spotify-style with indentation and progressive fade
  if (isDesktop) {
    const opacity = isCurrent ? 1 : Math.max(0.3, 1 - Math.abs(distanceFromCurrent) * 0.15);
    const indent = isCurrent ? 0 : 32;
    
    return (
      <div
        ref={lineRef}
        className={`text-center py-3 transition-all duration-300 ease-out ${
          isCurrent
            ? 'text-white text-2xl md:text-3xl font-bold'
            : 'text-white/90 text-base md:text-lg font-normal'
        }`}
        style={{
          opacity,
          paddingLeft: `${indent}px`,
          paddingRight: `${indent}px`,
        }}
      >
        {line.text || '♪'}
      </div>
    );
  }
  
  // Mobile: Centered current line with better visibility
  return (
    <div
      ref={lineRef}
      className={`text-center py-3 transition-all duration-300 ease-out ${
        isCurrent
          ? 'text-white text-xl font-bold'
          : isPast
          ? 'text-white/40 text-base'
          : 'text-white/60 text-base'
      }`}
    >
      {line.text || '♪'}
    </div>
  );
});

LyricLine.displayName = 'LyricLine';

export function LyricsPanel({ trackTitle, artistName, duration, currentTime, trackId }: LyricsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'synced' | 'plain'>('synced');
  const [noLyricsMessage] = useState(getRandomNoLyricsMessage());
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsContentRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  // Zustand store for caching
  const { getCached, setLyrics, setCurrentTrack } = useLyricsStore();
  
  // Create a cache key from track info
  const cacheKey = useMemo(() => 
    trackId || `${trackTitle}-${artistName}`, 
    [trackId, trackTitle, artistName]
  );
  
  // Get cached data
  const cachedEntry = getCached(cacheKey);
  const lyrics = cachedEntry?.lyrics ?? null;
  const syncedLines = cachedEntry?.syncedLines ?? [];

  // Detect desktop vs mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure container height for centering calculation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };
    
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    
    return () => observer.disconnect();
  }, []);

  // Fetch lyrics when track changes (only if not cached)
  useEffect(() => {
    let mounted = true;

    async function fetchLyrics() {
      if (!trackTitle || !artistName || !duration || duration <= 0) {
        return;
      }

      // Check cache first
      const cached = getCached(cacheKey);
      if (cached) {
        console.log('📝 Lyrics: Using cached lyrics for', trackTitle);
        setCurrentTrack(cacheKey);
        if (cached.syncedLines.length > 0) {
          setViewMode('synced');
        } else if (cached.lyrics?.plainLyrics) {
          setViewMode('plain');
        }
        setLoading(false);
        return;
      }

      console.log('📝 Lyrics: Fetching for', trackTitle, 'by', artistName);
      setLoading(true);
      setCurrentLineIndex(-1);

      const result = await getLyrics(trackTitle, artistName, duration);
      
      if (mounted) {
        setLyrics(cacheKey, result);
        setCurrentTrack(cacheKey);
        
        if (result?.syncedLyrics) {
          setViewMode('synced');
        } else if (result?.plainLyrics) {
          setViewMode('plain');
        }
        setLoading(false);
      }
    }

    fetchLyrics();

    return () => {
      mounted = false;
    };
  }, [cacheKey, trackTitle, artistName, duration, getCached, setLyrics, setCurrentTrack]);

  // Update current line based on playback time (memoized for performance)
  const updateCurrentLine = useCallback(() => {
    if (syncedLines.length > 0 && viewMode === 'synced') {
      const index = getCurrentLineIndex(syncedLines, currentTime);
      setCurrentLineIndex(index);
    }
  }, [syncedLines, currentTime, viewMode]);

  useEffect(() => {
    updateCurrentLine();
  }, [updateCurrentLine]);

  // Handle user interaction - PERMANENTLY disable auto-scroll
  const handleUserInteraction = useCallback(() => {
    if (!isAutoScrollEnabled) return; // Already disabled
    setIsAutoScrollEnabled(false);
  }, [isAutoScrollEnabled]);

  // Auto-scroll to center current line (both mobile and desktop)
  useEffect(() => {
    if (!isAutoScrollEnabled || currentLineIndex < 0 || !containerRef.current || !currentLineRef.current) return;
    
    const container = containerRef.current;
    const currentLine = currentLineRef.current;
    
    // Get the actual position of the current line element
    const lineRect = currentLine.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate where to scroll to center the current line
    const lineCenter = currentLine.offsetTop + (lineRect.height / 2);
    const targetScrollTop = lineCenter - (containerRect.height / 2);
    
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  }, [isAutoScrollEnabled, currentLineIndex]);

  // Loading state
  if (loading || (!cachedEntry && duration <= 0)) {
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
      <div className="h-full overflow-y-auto px-4 sm:px-6 py-6">
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

  // Has synced lyrics - Different behavior for desktop vs mobile
  if (lyrics.syncedLyrics && syncedLines.length > 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* View Mode Toggle */}
        {lyrics.plainLyrics && (
          <div className="flex items-center justify-center gap-2 py-3 border-b border-white/10 flex-shrink-0">
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

        {/* Lyrics Content - Scrollable container with centered current line */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-y-auto overflow-x-hidden px-4 overscroll-contain"
          onWheel={handleUserInteraction}
          onTouchMove={handleUserInteraction}
          onScroll={handleUserInteraction}
          style={{ 
            WebkitOverflowScrolling: 'touch' as any,
          }}
        >
          {viewMode === 'synced' ? (
            <>
              {/* Gradient overlays - absolute positioned */}
              <div className="sticky top-0 left-0 right-0 h-20 bg-gradient-to-b from-black via-black/70 to-transparent z-10 pointer-events-none -mb-20" />
              
              {/* Lyrics container with padding for centering */}
              <div 
                ref={lyricsContentRef}
                className="max-w-2xl mx-auto"
                style={{ 
                  paddingTop: `${containerHeight / 2}px`,
                  paddingBottom: `${containerHeight / 2}px`,
                }}
              >
                {syncedLines.map((line, index) => (
                  <LyricLine
                    key={index}
                    line={line}
                    isCurrent={index === currentLineIndex}
                    isPast={index < currentLineIndex}
                    isDesktop={isDesktop}
                    distanceFromCurrent={index - currentLineIndex}
                    lineRef={index === currentLineIndex ? currentLineRef : undefined}
                  />
                ))}
              </div>
              
              {/* Bottom gradient */}
              <div className="sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none -mt-20" />
            </>
          ) : (
            <div className="h-full overflow-y-auto py-6">
              <div className="max-w-2xl mx-auto whitespace-pre-wrap text-white/80 text-sm sm:text-base leading-relaxed">
                {lyrics.plainLyrics}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
