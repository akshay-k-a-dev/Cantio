import { motion } from 'framer-motion';
import { Music2, Play, ChevronDown } from 'lucide-react';
import { TopArtist } from '../services/recommendations';

interface ArtistCardProps {
  artist: TopArtist;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ArtistCard({ artist, index, isSelected, onSelect }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative rounded-xl p-3 border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-purple-500/20 border-purple-500/50'
          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10'
      }`}
      onClick={onSelect}
    >
      {/* Artist thumbnail */}
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

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-purple-500 rounded-full p-3 shadow-lg shadow-purple-500/30">
            {isSelected
              ? <ChevronDown size={20} className="text-white" />
              : <Play size={20} fill="white" className="text-white" />}
          </div>
        </div>

        {/* Selected ring */}
        {isSelected && (
          <div className="absolute inset-0 ring-2 ring-purple-500 rounded-lg" />
        )}
      </div>

      {/* Artist info */}
      <div>
        <h3 className={`text-sm font-semibold truncate mb-0.5 ${
          isSelected ? 'text-purple-300' : 'text-white'
        }`}>
          {artist.name}
        </h3>
        <p className="text-[11px] text-gray-500">
          {artist.tracks.length} {artist.tracks.length === 1 ? 'track' : 'tracks'} · {artist.playCount} {artist.playCount === 1 ? 'play' : 'plays'}
        </p>
      </div>
    </motion.div>
  );
}
