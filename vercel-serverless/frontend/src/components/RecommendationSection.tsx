import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Track } from '../lib/cache';
import TrackCard from './TrackCard';

interface RecommendationSectionProps {
  title: string;
  description?: string;
  tracks: Track[];
  onViewAll?: () => void;
  hideHeader?: boolean;
}

export default function RecommendationSection({
  title,
  description,
  tracks,
  onViewAll,
  hideHeader = false,
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
      {!hideHeader && (
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
      )}

      {/* Vertical grid on all screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {tracks.map((track, index) => (
          <TrackCard key={`${track.videoId}-${index}`} track={track} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
