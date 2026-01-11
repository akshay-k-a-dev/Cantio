import { motion } from 'framer-motion';
import { Music2, Play } from 'lucide-react';
import { TopArtist } from '../services/recommendations';
import { usePlayer } from '../services/player';

interface ArtistCardProps {
  artist: TopArtist;
  index: number;
}

export default function ArtistCard({ artist, index }: ArtistCardProps) {
  const { play, addToQueue } = usePlayer();
  
  const handlePlayAll = () => {
    if (artist.tracks.length > 0) {
      // Play first track and add rest to queue
      play(artist.tracks[0]);
      artist.tracks.slice(1).forEach(track => {
        addToQueue(track);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.03 }}
      className="group relative bg-white/[0.03] rounded-xl p-3 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer"
      onClick={handlePlayAll}
    >
      {/* Artist thumbnail (using first track) */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
        {artist.tracks[0]?.thumbnail ? (
          <img
            src={artist.tracks[0].thumbnail}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Music2 size={32} className="text-gray-600" />
          </div>
        )}
        
        {/* Play overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="bg-purple-500 rounded-full p-3 shadow-lg shadow-purple-500/30">
            <Play size={20} fill="white" className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* Artist info */}
      <div>
        <h3 className="text-sm font-semibold text-white truncate mb-0.5">
          {artist.name}
        </h3>
        <p className="text-[11px] text-gray-500">
          {artist.playCount} {artist.playCount === 1 ? 'play' : 'plays'}
        </p>
      </div>
    </motion.div>
  );
}
