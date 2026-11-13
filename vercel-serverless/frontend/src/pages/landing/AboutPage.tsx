import { Github, Heart, Code2, Lock, Zap } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

export function AboutPage() {
  return (
    <LandingLayout
      title="About Cantio — Privacy-First Open Source Music"
      description="Learn about Cantio's mission to reclaim music streaming privacy. Built by developers, for privacy advocates. Fully open source, zero tracking."
    >
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#A4C4D4] via-[#518EAC] to-[#619CA9] bg-clip-text text-transparent">
            About Cantio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Music streaming without the surveillance. Built by developers who believe your listening history belongs to you.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-300 mb-4">
              Most music apps force you to choose between two evils: pay for premium, or let them track and monetize your data.
            </p>
            <p className="text-gray-300 mb-4">
              Cantio was built to prove there's a third option. A music player that respects you. No tracking. No ads. No forced accounts.
            </p>
            <p className="text-gray-300">
              We believe your listening habits are personal data. They should stay on your device unless you explicitly choose to sync them.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#0F4C6C]/30 to-[#518EAC]/20 rounded-xl p-8 border border-[#518EAC]/20">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-[#518EAC] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Zero Tracking</h3>
                  <p className="text-sm text-gray-400">No analytics, no telemetry, no behavioral data collection</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-[#518EAC] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">User-Focused</h3>
                  <p className="text-sm text-gray-400">Every feature is designed for the user, not the advertiser</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Code2 className="w-5 h-5 text-[#518EAC] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Open Source</h3>
                  <p className="text-sm text-gray-400">Audit every line. No black boxes. Full transparency.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built by a Developer, for Developers</h2>
          <p className="text-gray-400">Created by Akshay K A, who believed music streaming could be better.</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3">Why Cantio?</h3>
          <p className="text-gray-300 mb-4">
            Every major music app collects user data to fuel recommendations, personalized ads, and algorithmic playlists. While convenient, this comes at a privacy cost.
          </p>
          <p className="text-gray-300 mb-4">
            Cantio was built to show that you don't need to sacrifice privacy for a great music experience. By leveraging YouTube Music's existing catalog and API, Cantio delivers unlimited streaming without the surveillance.
          </p>
          <p className="text-gray-300">
            The code is open source (MIT license) so you can verify every claim about privacy and security.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gradient-to-br from-[#0F4C6C]/20 to-transparent border border-[#518EAC]/20 rounded-lg">
            <Lock className="w-8 h-8 text-[#518EAC] mb-4" />
            <h3 className="text-xl font-bold mb-3">Privacy First</h3>
            <p className="text-gray-400">
              Your data is yours. We don't track, analyze, or monetize your listening habits. Ever.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#619CA9]/20 to-transparent border border-[#619CA9]/20 rounded-lg">
            <Zap className="w-8 h-8 text-[#619CA9] mb-4" />
            <h3 className="text-xl font-bold mb-3">User Control</h3>
            <p className="text-gray-400">
              Features like sync and accounts are entirely optional. Use guest mode forever if you want.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 rounded-lg">
            <Github className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Transparency</h3>
            <p className="text-gray-400">
              Open source code, clear policies, no hidden business model. See exactly what we do.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Built with Modern Tech</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• React 18 — Modern UI framework</li>
                <li>• Vite — Lightning-fast build tool</li>
                <li>• Tailwind CSS — Utility-first styling</li>
                <li>• Zustand — State management</li>
                <li>• Framer Motion — Smooth animations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Backend & Infrastructure</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Fastify — Fast Node.js server</li>
                <li>• Prisma — Type-safe ORM</li>
                <li>• PostgreSQL — Reliable database</li>
                <li>• Vercel — Serverless deployment</li>
                <li>• Innertube API — YouTube Music integration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Take Control?</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Start streaming music right now. No signup required. No account, no ads, no tracking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/" className="px-8 py-3 bg-[#518EAC] hover:bg-[#619CA9] text-white rounded-lg font-semibold transition">
            Try Cantio Now
          </a>
          <a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-lg font-semibold transition flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>
      </section>
    </LandingLayout>
  );
}
