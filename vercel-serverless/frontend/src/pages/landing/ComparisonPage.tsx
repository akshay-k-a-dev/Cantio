import { Check, X } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

const comparison = [
  {
    feature: 'No Account Required',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'Zero Tracking / Analytics',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'No Ads (Ever)',
    cantio: true,
    spotify: 'Premium only',
    apple: true,
    youtube: false
  },
  {
    feature: 'Open Source & Auditable',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'Cross-Platform (Web, Desktop, Mobile)',
    cantio: true,
    spotify: true,
    apple: false,
    youtube: true
  },
  {
    feature: 'Optional Cloud Sync',
    cantio: true,
    spotify: 'Required',
    apple: 'Required',
    youtube: 'Required'
  },
  {
    feature: 'Forever Free',
    cantio: true,
    spotify: 'Limited',
    apple: false,
    youtube: true
  },
  {
    feature: 'Works Offline',
    cantio: 'PWA',
    spotify: 'Premium only',
    apple: 'Premium only',
    youtube: false
  },
  {
    feature: 'No Forced Algorithm',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'Data Ownership',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'Community-Driven',
    cantio: true,
    spotify: false,
    apple: false,
    youtube: false
  },
  {
    feature: 'Desktop Apps (Windows/Linux)',
    cantio: true,
    spotify: true,
    apple: false,
    youtube: false
  }
];

export function ComparisonPage() {
  return (
    <LandingLayout
      title="Cantio vs Spotify vs Apple Music vs YouTube Music"
      description="Detailed feature comparison: Cantio privacy-first music player vs Spotify, Apple Music, YouTube Music, and other streaming alternatives."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#A4C4D4] via-[#518EAC] to-[#619CA9] bg-clip-text text-transparent">
            Cantio vs The Competition
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how Cantio stacks up against the biggest music streaming platforms.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 font-semibold text-gray-300">Feature</th>
                <th className="text-center py-4 px-4 font-semibold">
                  <div className="text-[#518EAC]">Cantio</div>
                  <div className="text-xs text-gray-400">Privacy-First</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  <div>Spotify</div>
                  <div className="text-xs text-gray-400">Freemium</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  <div>Apple Music</div>
                  <div className="text-xs text-gray-400">Subscription</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  <div>YouTube Music</div>
                  <div className="text-xs text-gray-400">YouTube-Tied</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, idx) => (
                <tr key={idx} className={`border-b border-gray-800 ${idx % 2 === 0 ? 'bg-black/20' : ''}`}>
                  <td className="py-4 px-4 font-medium text-gray-300">{row.feature}</td>
                  <td className="text-center py-4 px-4">
                    {row.cantio === true ? (
                      <Check className="w-5 h-5 text-[#518EAC] mx-auto" />
                    ) : row.cantio === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-400">{row.cantio}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.spotify === true ? (
                      <Check className="w-5 h-5 text-[#518EAC] mx-auto" />
                    ) : row.spotify === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-400">{row.spotify}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.apple === true ? (
                      <Check className="w-5 h-5 text-[#518EAC] mx-auto" />
                    ) : row.apple === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-400">{row.apple}</span>
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {row.youtube === true ? (
                      <Check className="w-5 h-5 text-[#518EAC] mx-auto" />
                    ) : row.youtube === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-400">{row.youtube}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deep Dive Comparisons */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12">Detailed Comparisons</h2>

        <div className="space-y-8">
          {/* vs Spotify */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gradient-to-br from-[#0F4C6C]/10 to-transparent">
            <h3 className="text-2xl font-bold mb-4">Cantio vs Spotify</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#518EAC] mb-3">✓ Cantio Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• No forced account or sign-up</li>
                  <li>• Zero data tracking or analytics</li>
                  <li>• Works completely offline (PWA)</li>
                  <li>• No ads, even on free tier</li>
                  <li>• Open source — audit the code</li>
                  <li>• No algorithmic manipulation</li>
                  <li>• Your data stays on your device</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-3">✗ Spotify Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Vastly larger music catalog</li>
                  <li>• Advanced recommendations</li>
                  <li>• Desktop app more polished</li>
                  <li>• More third-party integrations</li>
                  <li>• Better mobile experience</li>
                  <li>• Social features (shared playlists, etc)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#0F4C6C]/20 border border-[#518EAC]/50 rounded">
              <p className="text-[#A4C4D4]">
                <strong>Bottom Line:</strong> If you prioritize privacy and want to listen without tracking, Cantio is superior. If you want the most polished experience with advanced features, Spotify still leads—but at the cost of your data.
              </p>
            </div>
          </div>

          {/* vs YouTube Music */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gradient-to-br from-blue-900/10 to-transparent">
            <h3 className="text-2xl font-bold mb-4">Cantio vs YouTube Music</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#518EAC] mb-3">✓ Cantio Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• No Google account required</li>
                  <li>• Better privacy (no Google tracking)</li>
                  <li>• Desktop app available (Electron)</li>
                  <li>• Simpler, cleaner interface</li>
                  <li>• Open source and transparent</li>
                  <li>• Works fully offline (PWA)</li>
                  <li>• No YouTube account dependency</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-3">✗ YouTube Music Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Official YouTube Music integration</li>
                  <li>• Music videos available</li>
                  <li>• Larger recommendation ecosystem</li>
                  <li>• More sophisticated UI</li>
                  <li>• YouTube Premium includes it</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded">
              <p className="text-blue-300">
                <strong>Bottom Line:</strong> Cantio is a lighter-weight, privacy-respecting YouTube Music frontend. If you want YouTube Music without the Google tracking, Cantio is the answer.
              </p>
            </div>
          </div>

          {/* vs Apple Music */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gradient-to-br from-[#619CA9]/10 to-transparent">
            <h3 className="text-2xl font-bold mb-4">Cantio vs Apple Music</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#518EAC] mb-3">✓ Cantio Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Works on Windows and Linux</li>
                  <li>• No subscription required</li>
                  <li>• No Apple account lock-in</li>
                  <li>• Open source transparency</li>
                  <li>• Lighter weight</li>
                  <li>• Community-driven development</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-3">✗ Apple Music Wins On</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Seamless Apple ecosystem</li>
                  <li>• Lossless audio (if subscribed)</li>
                  <li>• Spatial audio support</li>
                  <li>• Better iOS integration</li>
                  <li>• Included with Apple One</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#619CA9]/20 border border-[#619CA9]/50 rounded">
              <p className="text-[#A4C4D4]">
                <strong>Bottom Line:</strong> Apple Music is great if you're in the Apple ecosystem. Cantio is better if you use multiple platforms and value privacy over audio quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Choose Each */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-12 text-center">Choose Cantio If You...</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-[#0F4C6C]/20 to-transparent border border-[#518EAC]/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🔒 Value Privacy</h3>
            <p className="text-gray-300">Don't want your listening habits tracked or sold to advertisers.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">👨‍💻 Love Open Source</h3>
            <p className="text-gray-300">Want auditable code and community-driven development.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#619CA9]/20 to-transparent border border-[#619CA9]/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">💰 Prefer Free</h3>
            <p className="text-gray-300">Want unlimited music without paying subscription fees.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#518EAC]/20 to-transparent border border-[#518EAC]/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🖥️ Use Windows/Linux</h3>
            <p className="text-gray-300">Need a desktop app that works on non-Apple platforms.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-transparent border border-yellow-500/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🚀 Like Minimalism</h3>
            <p className="text-gray-300">Prefer simple interfaces without algorithmic manipulation.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-lg">
            <h3 className="font-bold text-lg mb-3">📱 Multi-Platform</h3>
            <p className="text-gray-300">Want seamless sync across web, desktop, and mobile.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Make Your Choice</h2>
        <p className="text-gray-400 mb-8">No account needed. Try Cantio now and see the difference.</p>
        <a href="/" className="inline-block px-8 py-3 bg-[#518EAC] hover:bg-[#619CA9] rounded-lg font-semibold transition">
          Start Listening Now
        </a>
      </section>
    </LandingLayout>
  );
}
