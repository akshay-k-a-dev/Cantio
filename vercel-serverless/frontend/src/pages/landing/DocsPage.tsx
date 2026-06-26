import { Code2, Github, BookOpen, Zap, GitBranch } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

export function DocsPage() {
  return (
    <LandingLayout
      title="Cantio Documentation — Getting Started & API"
      description="Learn how to use Cantio, deploy it, integrate with APIs, and contribute to the project."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn how to use, deploy, and extend Cantio.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-800 rounded-lg">
            <div className="text-3xl mb-4">🎵</div>
            <h3 className="font-bold text-lg mb-3">1. Open the App</h3>
            <p className="text-gray-400 text-sm">
              Go to <a href="https://music.akshayka.dev" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">music.akshayka.dev</a> and start streaming immediately.
            </p>
          </div>
          
          <div className="p-6 border border-gray-800 rounded-lg">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-bold text-lg mb-3">2. Search & Play</h3>
            <p className="text-gray-400 text-sm">
              Search for any song available on YouTube Music. Click to play and enjoy ad-free streaming.
            </p>
          </div>
          
          <div className="p-6 border border-gray-800 rounded-lg">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="font-bold text-lg mb-3">3. Create Account (Optional)</h3>
            <p className="text-gray-400 text-sm">
              Sign up to sync playlists and likes across devices. Or keep using guest mode forever.
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Core Features Guide</h2>
        
        <div className="space-y-6">
          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">🎧 Playback Controls</h3>
            <p className="text-gray-400 mb-3">
              Use play, pause, next, previous buttons. Switch between shuffle, repeat-one, and repeat-all modes. Drag songs in the queue to reorder.
            </p>
            <code className="text-xs bg-black/50 p-2 rounded block text-gray-300">Keyboard: Space (play/pause) • Arrow keys (skip)</code>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">❤️ Liked Songs</h3>
            <p className="text-gray-400 mb-3">
              Click the heart icon to like any track. Liked songs appear in your "Liked" library. If logged in, these sync across devices.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">📋 Playlists</h3>
            <p className="text-gray-400 mb-3">
              Create unlimited playlists in guest mode (stored locally) or create cloud playlists when logged in. Add songs by clicking the add icon.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">🎵 Blends (Beta)</h3>
            <p className="text-gray-400 mb-3">
              Create a "blend" with a friend to combine your music tastes. You'll each get a unique shared playlist based on your likes.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2">📜 Synced Lyrics</h3>
            <p className="text-gray-400 mb-3">
              For supported tracks, view real-time lyrics that sync with playback. Click the lyrics icon on the now-playing bar.
            </p>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-8">Installation</h2>
        
        <div className="space-y-6">
          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Web App (Recommended)
            </h3>
            <p className="text-gray-400 mb-3">
              No installation needed. Just visit <code className="bg-black/50 px-2 py-1 rounded text-purple-300">music.akshayka.dev</code> and start playing.
            </p>
            <p className="text-gray-400">
              To install as PWA: Open in your browser → Menu → "Install Cantio" (desktop) or "Add to Home Screen" (mobile).
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              Desktop Apps
            </h3>
            <p className="text-gray-400 mb-4">Available for Windows and Linux:</p>
            <ul className="space-y-2 text-gray-400 mb-4">
              <li>• Windows: <code className="bg-black/50 px-2 py-1 rounded text-purple-300">Cantio.Setup.1.0.0.exe</code></li>
              <li>• Linux (Debian): <code className="bg-black/50 px-2 py-1 rounded text-purple-300">cantio-desktop_1.0.0_amd64.deb</code></li>
              <li>• Linux (AppImage): <code className="bg-black/50 px-2 py-1 rounded text-purple-300">Cantio-1.0.0.AppImage</code></li>
            </ul>
            <a href="https://github.com/akshay-k-a-dev/Cantio/releases" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              Download from GitHub Releases →
            </a>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-400" />
              Mobile Apps
            </h3>
            <p className="text-gray-400 mb-3">
              A standalone Android app is available for download as an APK. The iOS app is currently in progress.
            </p>
            <a href="https://github.com/akshay-k-a-dev/Cantio_Mobile/releases/download/android/app-release.apk" className="text-purple-400 hover:text-purple-300">
              Download Android APK →
            </a>
          </div>
        </div>
      </section>

      {/* For Developers */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">For Developers</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Github className="w-5 h-5 text-purple-400" />
              Clone & Run Locally
            </h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="font-mono bg-black/50 p-3 rounded">git clone https://github.com/akshay-k-a-dev/Cantio.git</p>
              <p className="font-mono bg-black/50 p-3 rounded">cd Cantio/vercel-serverless/frontend</p>
              <p className="font-mono bg-black/50 p-3 rounded">npm install && npm run dev</p>
              <p>Backend setup instructions in <code className="bg-black/50 px-1 rounded">vercel-serverless/backend/README.md</code></p>
            </div>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              Tech Stack
            </h3>
            <div className="space-y-2 text-gray-400">
              <p><strong className="text-white">Frontend:</strong> React 18, Vite, Tailwind, Zustand</p>
              <p><strong className="text-white">Backend:</strong> Fastify, TypeScript, Prisma, PostgreSQL</p>
              <p><strong className="text-white">Music API:</strong> Innertube (YouTubei.js)</p>
              <p><strong className="text-white">Desktop:</strong> Electron</p>
              <p><strong className="text-white">Mobile:</strong> Flutter (Android APK released, iOS in progress)</p>
            </div>
          </div>
        </div>

        <div className="p-6 border border-purple-500/30 bg-purple-900/10 rounded-lg">
          <h3 className="font-bold text-lg mb-4">🤝 Contributing</h3>
          <p className="text-gray-300 mb-4">
            Cantio welcomes contributions! To contribute:
          </p>
          <ol className="space-y-2 text-gray-400 list-decimal list-inside">
            <li>Fork the repository</li>
            <li>Create a feature branch</li>
            <li>Make your changes</li>
            <li>Submit a pull request</li>
          </ol>
          <a href="https://github.com/akshay-k-a-dev/Cantio/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            View Contribution Guidelines →
          </a>
        </div>
      </section>

      {/* API Reference */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-8">API Reference (Internal)</h2>
        
        <p className="text-gray-400 mb-8">
          Cantio's backend API is used internally by the frontend. For details on endpoints, see the backend repository.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
            <p className="font-mono text-purple-300 mb-2">GET /api/search?q=query</p>
            <p className="text-gray-400 text-sm">Search YouTube Music for tracks</p>
          </div>

          <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
            <p className="font-mono text-purple-300 mb-2">GET /api/track/:id</p>
            <p className="text-gray-400 text-sm">Get track metadata and stream URL</p>
          </div>

          <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
            <p className="font-mono text-purple-300 mb-2">POST /api/auth/register</p>
            <p className="text-gray-400 text-sm">Create a new account</p>
          </div>

          <div className="p-4 bg-black/50 rounded-lg border border-gray-800">
            <p className="font-mono text-purple-300 mb-2">GET /api/user/likes</p>
            <p className="text-gray-400 text-sm">Get liked songs for logged-in user</p>
          </div>
        </div>

        <a href="https://github.com/akshay-k-a-dev/Cantio/tree/main/vercel-serverless/backend" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 mt-6 inline-block">
          View Full Backend Documentation →
        </a>
      </section>

      {/* Deployment */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Deployment</h2>
        
        <div className="p-6 border border-gray-800 rounded-lg bg-gradient-to-br from-gray-900/50 to-transparent">
          <h3 className="font-bold text-lg mb-4">Self-Hosting</h3>
          <p className="text-gray-400 mb-4">
            Cantio can be self-hosted on your own infrastructure. The backend uses Node.js + PostgreSQL and can run on any modern server.
          </p>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>• Requirements: Node.js 16+, PostgreSQL 12+</p>
            <p>• Deployment options: Docker, Vercel, Railway, Heroku, AWS, DigitalOcean, etc.</p>
            <p>• Environment setup guide: See <code className="bg-black/50 px-1 rounded">.env.example</code> in backend</p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center">Additional Resources</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="p-6 border border-gray-800 hover:border-purple-500/50 rounded-lg transition">
            <h3 className="font-bold text-lg mb-2">📚 GitHub Repository</h3>
            <p className="text-gray-400 text-sm">Source code, issues, and pull requests</p>
          </a>

          <a href="https://github.com/akshay-k-a-dev/Cantio/issues" target="_blank" rel="noopener noreferrer" className="p-6 border border-gray-800 hover:border-cyan-500/50 rounded-lg transition">
            <h3 className="font-bold text-lg mb-2">🐛 Report Issues</h3>
            <p className="text-gray-400 text-sm">Found a bug? Let us know on GitHub</p>
          </a>

          <a href="mailto:auth.cantio@gmail.com" className="p-6 border border-gray-800 hover:border-pink-500/50 rounded-lg transition">
            <h3 className="font-bold text-lg mb-2">💬 Get Support</h3>
            <p className="text-gray-400 text-sm">Email us at auth.cantio@gmail.com</p>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-8">Start using or building Cantio today.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
            Try Cantio Now
          </a>
          <a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-semibold transition">
            View on GitHub
          </a>
        </div>
      </section>
    </LandingLayout>
  );
}
