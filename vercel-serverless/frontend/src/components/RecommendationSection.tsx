import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Track } from '../lib/cache';
import TrackCard from './TrackCard';

interface RecommendationSectionProps {
  title: string;
  description?: string;
  tracks: Track[];
  onViewAll?: () => void;
}

export default function RecommendationSection({
  title,
  description,
  tracks,
  onViewAll,
}: RecommendationSectionProps) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        
        {onViewAll && tracks.length > 6 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-hide">
          {tracks.slice(0, 6).map((track, index) => (
            <div key={`${track.videoId}-${index}`} className="flex-shrink-0 w-64 md:w-auto">
              <TrackCard track={track} index={index} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
