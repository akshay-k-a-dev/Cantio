import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Mic2, Disc3, ChevronRight, Sparkles, X, Loader2 } from 'lucide-react';
import { useAuth, api } from '../lib/authStore';

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada',
  'Bengali', 'Marathi', 'Punjabi', 'Spanish', 'Korean', 'Japanese',
  'French', 'Arabic', 'Portuguese', 'German', 'Russian', 'Chinese',
];

const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'EDM', 'Jazz', 'Classical',
  'Indie', 'Metal', 'Country', 'Reggae', 'Latin', 'K-Pop', 'Lo-Fi',
  'Bollywood', 'Carnatic', 'Devotional', 'Folk', 'Sufi', 'Trap',
];

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ArtistResult {
  type: 'artist';
  browseId: string;
  name: string;
  thumbnail: string;
  subscribers?: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Favorite Languages',
    description: 'What languages do you enjoy music in?',
    icon: <Globe size={24} />,
  },
  {
    title: 'Favorite Artists',
    description: 'Name some artists you love (type and press Enter)',
    icon: <Mic2 size={24} />,
  },
  {
    title: 'Favorite Genres',
    description: 'Pick the genres that match your vibe',
    icon: <Disc3 size={24} />,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [languages, setLanguages] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [artistImages, setArtistImages] = useState<Record<string, string>>({});
  const [artistInput, setArtistInput] = useState('');
  const [artistResults, setArtistResults] = useState<ArtistResult[]>([]);
  const [artistSearchLoading, setArtistSearchLoading] = useState(false);
  const [artistSearchError, setArtistSearchError] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true); // guard: skip if already onboarded
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }

    // Check if this user actually needs onboarding — redirect to / if already done
    api.fetch('/preferences/needs-onboarding')
      .then(r => r.json())
      .then(data => {
        if (!data.needsOnboarding) {
          navigate('/');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        // If check fails, show onboarding anyway (safe fallback)
        setChecking(false);
      });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const query = artistInput.trim();
    if (step !== 1 || query.length < 2) {
      setArtistResults([]);
      setArtistSearchLoading(false);
      setArtistSearchError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setArtistSearchLoading(true);
      setArtistSearchError('');

      try {
        const params = new URLSearchParams({
          q: query,
          type: 'artists',
          limit: '6',
        });
        const response = await api.fetch(`/search/music?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Artist search failed');

        const data = await response.json();
        setArtistResults((data.results || []).filter((item: ArtistResult) => item.type === 'artist'));
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Artist search failed:', err);
        setArtistSearchError('Artist search is unavailable right now.');
        setArtistResults([]);
      } finally {
        if (!controller.signal.aborted) setArtistSearchLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [artistInput, step]);

  const toggleItem = (
    list: string[],
    setter: (v: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const addArtist = (name = artistInput, thumbnail = '') => {
    const trimmed = name.trim();
    const exists = artists.some(artist => artist.toLowerCase() === trimmed.toLowerCase());
    if (trimmed && !exists) {
      setArtists([...artists, trimmed]);
      if (thumbnail) {
        setArtistImages(prev => ({ ...prev, [trimmed]: thumbnail }));
      }
    }
    setArtistInput('');
    setArtistResults([]);
  };

  const removeArtist = (name: string) => {
    setArtists(artists.filter(a => a !== name));
    setArtistImages(({ [name]: _removed, ...rest }) => rest);
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      // Save to user_preferences (marks onboardingDone and stores choices)
      const response = await api.fetch('/preferences', {
        method: 'POST',
        body: JSON.stringify({
          favoriteLanguages: languages,
          favoriteArtists: artists,
          favoriteGenres: genres,
          onboardingDone: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to save preferences');

      // Fire-and-forget: seed recommendations from preferences in the background.
      // Non-blocking — if this fails, user still gets to the home page.
      api.fetch('/preferences/seed', { method: 'POST' }).catch(() => {});

      navigate('/');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Could not save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await api.fetch('/preferences', {
        method: 'POST',
        body: JSON.stringify({ onboardingDone: true }),
      });
      if (!response.ok) throw new Error('Failed to skip onboarding');
      navigate('/');
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      setError('Could not update onboarding status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Show spinner while checking onboarding status
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-8 h-8 rounded-full border-2 border-[#518EAC] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="glass p-6 sm:p-8 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={20} className="text-[#518EAC]" />
              <span className="text-xs font-medium text-[#518EAC] uppercase tracking-wider">
                Personalize Your Experience
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome to Cantio!</h1>
            <p className="text-gray-400 text-sm">
              Tell us about your music taste for better recommendations
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Step progress */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-[#518EAC]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#518EAC]/20 text-[#A4C4D4]">
                  {STEPS[step].icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{STEPS[step].title}</h2>
                  <p className="text-xs text-gray-400">{STEPS[step].description}</p>
                </div>
              </div>

              {/* Step 0: Languages */}
              {step === 0 && (
                <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto py-1">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleItem(languages, setLanguages, lang)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        languages.includes(lang)
                          ? 'bg-[#518EAC] text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Artists */}
              {step === 1 && (
                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={artistInput}
                      onChange={e => setArtistInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArtist())}
                      placeholder="Search artist, e.g., Arjith Singh"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-[#518EAC] focus:ring-1 focus:ring-[#518EAC]/30 outline-none text-sm text-white placeholder-gray-500"
                    />
                    <button
                      onClick={() => addArtist()}
                      disabled={!artistInput.trim()}
                      className="px-4 py-2.5 bg-[#0F4C6C] hover:bg-[#518EAC] disabled:opacity-30 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {(artistSearchLoading || artistResults.length > 0 || artistSearchError) && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      {artistSearchLoading && (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400">
                          <Loader2 size={16} className="animate-spin text-[#518EAC]" />
                          Searching artists...
                        </div>
                      )}
                      {!artistSearchLoading && artistSearchError && (
                        <div className="px-3 py-3 text-sm text-red-300">
                          {artistSearchError}
                        </div>
                      )}
                      {!artistSearchLoading && artistResults.map(result => (
                        <button
                          key={result.browseId || result.name}
                          type="button"
                          onClick={() => addArtist(result.name, result.thumbnail)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/10"
                        >
                          {result.thumbnail ? (
                            <img
                              src={result.thumbnail}
                              alt={result.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#518EAC]/20 text-[#A4C4D4]">
                              <Mic2 size={18} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{result.name}</p>
                            {result.subscribers && (
                              <p className="truncate text-xs text-gray-500">{result.subscribers}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {artists.map(name => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#518EAC]/20 text-[#A4C4D4] rounded-full text-sm"
                      >
                        {artistImages[name] && (
                          <img
                            src={artistImages[name]}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        )}
                        {name}
                        <button onClick={() => removeArtist(name)} className="hover:text-white transition-colors">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {artists.length === 0 && (
                      <p className="text-gray-500 text-sm">No artists added yet — type above and press Enter</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Genres */}
              {step === 2 && (
                <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto py-1">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleItem(genres, setGenres, genre)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        genres.includes(genre)
                          ? 'bg-[#518EAC] text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <button
              onClick={handleSkip}
              disabled={saving}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                >
                  Back
                </button>
              )}
              {isLastStep ? (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#0F4C6C] hover:bg-[#518EAC] disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Finish'}
                  <Sparkles size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={saving}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-medium bg-[#0F4C6C] hover:bg-[#518EAC] text-white rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
