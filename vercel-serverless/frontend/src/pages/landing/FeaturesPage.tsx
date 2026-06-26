import { Music, Zap, Lock, Share2, Globe, BarChart3, Cloud, Smartphone } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

const features = [
  {
    category: 'Playback',
    icon: Music,
    items: [
      { title: 'Stream from YouTube Music', desc: 'Access millions of songs without ads or interruptions' },
      { title: 'Unlimited Skips', desc: 'Skip any song, anytime. No quota limits.' },
      { title: 'Multiple Playback Modes', desc: 'Shuffle, repeat-track, repeat-queue, seek control' },
      { title: 'Drag-and-Drop Queue', desc: 'Reorder songs with auto-scroll in the queue' },
      { title: 'Synced Lyrics', desc: 'Real-time lyrics display synchronized with playback' },
    ]
  },
  {
    category: 'Library & Curation',
    icon: Share2,
    items: [
      { title: 'Liked Songs', desc: 'Save your favorite tracks with a heart tap' },
      { title: 'Multiple Playlists', desc: 'Create unlimited custom playlists' },
      { title: 'Blends (Beta)', desc: 'Merge your taste with a friend\'s for a shared playlist' },
      { title: 'Play History', desc: 'Track what you\'ve listened to with reverse-queue (true "previous" button)' },
      { title: 'Offline Playback (PWA)', desc: 'Listen on the go without internet connection' },
    ]
  },
  {
    category: 'Privacy & Sync',
    icon: Lock,
    items: [
      { title: 'Guest Mode', desc: 'Use fully offline. No login ever required.' },
      { title: 'Zero Tracking', desc: 'No analytics, telemetry, or behavioral data collection' },
      { title: 'Optional Cloud Sync', desc: 'Sync liked songs, playlists, history across devices (when logged in)' },
      { title: 'Open Source', desc: 'Fully auditable code. No black boxes.' },
      { title: 'Your Data Stays Yours', desc: 'We don\'t sell or share any listening data' },
    ]
  },
  {
    category: 'Platforms',
    icon: Globe,
    items: [
      { title: 'Web App (PWA)', desc: 'Installable on any device. Works on mobile, tablet, desktop.' },
      { title: 'Desktop Apps', desc: 'Native Electron apps for Windows and Linux' },
      { title: 'Mobile App', desc: 'Standalone Android APK available. iOS app in progress.' },
      { title: 'Cross-Platform Sync', desc: 'Seamlessly move between web, desktop, and mobile' },
    ]
  }
];

export function FeaturesPage() {
  return (
    <LandingLayout
      title="Cantio Features — Music Without Tracking"
      description="Explore Cantio's powerful features: streaming, playlists, blends, lyrics, offline playback, and zero-tracking privacy."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need for unlimited music streaming, without the surveillance.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      {features.map((category, idx) => (
        <section key={idx} className={`px-4 sm:px-6 lg:px-8 py-16 ${idx % 2 === 1 ? 'bg-gray-900/50' : ''} ${idx < features.length - 1 ? 'border-b border-gray-800' : ''}`}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <category.icon className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold">{category.category}</h2>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {category.items.map((item, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 hover:border-purple-500/50 rounded-lg transition">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Comparison with others */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Cantio?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-center py-3 px-4">Cantio</th>
                <th className="text-center py-3 px-4">Spotify</th>
                <th className="text-center py-3 px-4">Apple Music</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">No Account Required</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">✗</td>
                <td className="text-center">✗</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Zero Tracking</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">✗</td>
                <td className="text-center">✗</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">No Ads</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">Premium only</td>
                <td className="text-center">✓</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Open Source</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">✗</td>
                <td className="text-center">✗</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4">Optional Cloud Sync</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">Required</td>
                <td className="text-center">Required</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Forever Free</td>
                <td className="text-center"><span className="text-green-400">✓</span></td>
                <td className="text-center">Limited</td>
                <td className="text-center">Subscription</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Experience the Difference</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          All these features. Zero tracking. Start streaming now.
        </p>
        <a href="/" className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
          Try Cantio Now
        </a>
      </section>
    </LandingLayout>
  );
}
