import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../services/player';
import { Loader2, AlertCircle } from 'lucide-react';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

export function TrackPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { play, currentTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrack = async () => {
      if (!videoId) {
        setError('No track ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if this track is already playing
        if (currentTrack?.videoId === videoId) {
          navigate('/');
          return;
        }

        // Fetch track metadata from backend
        const response = await fetch(`${API_BASE}/track/${videoId}`);
        if (!response.ok) {
          const text = await response.text();
          console.error('Track fetch failed:', response.status, text);
          throw new Error(`Failed to load track: ${response.status}`);
        }

        const track = await response.json();
        
        // Play the track
        await play({
          videoId: track.videoId,
          title: track.title,
          artist: track.artist || 'Unknown Artist',
          thumbnail: track.thumbnail,
          duration: track.duration
        });

        // Wait a bit for player state to be set
        await new Promise(resolve => setTimeout(resolve, 300));

        // Navigate to home page where the player will be visible
        navigate('/');
      } catch (err) {
        console.error('Error loading track:', err);
        setError(err instanceof Error ? err.message : 'Failed to load track');
      } finally {
        setLoading(false);
      }
    };

    loadTrack();
  }, [videoId, navigate, play, currentTrack]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
        <p className="text-white/60 text-sm">Loading track...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-white text-lg font-medium">Failed to load track</p>
        <p className="text-white/60 text-sm">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-full transition"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return null;
}
