import { Users, Building2, Code, Briefcase, Heart, Zap } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

const useCases = [
  {
    icon: Heart,
    title: 'Privacy-Conscious Listeners',
    desc: 'For people who value privacy and don\'t want their listening habits tracked by corporations.',
    details: [
      'No behavioral profiling',
      'No ads based on your taste',
      'No data sold to advertisers',
      'Listen offline without tracking'
    ]
  },
  {
    icon: Code,
    title: 'Developers & Technologists',
    desc: 'For engineers interested in music APIs, open source projects, or building on top of Cantio.',
    details: [
      'Audit the full codebase',
      'Self-hosted option available',
      'Contribute to the project',
      'Build integrations'
    ]
  },
  {
    icon: Zap,
    title: 'Minimalist Users',
    desc: 'For people who want a lightweight, ad-free music player without bloat or distractions.',
    details: [
      'Fast, lightweight interface',
      'No algorithmic recommendations pushing engagement',
      'Focus on playback quality',
      'Works on low-bandwidth connections'
    ]
  },
  {
    icon: Building2,
    title: 'Organizations & Teams',
    desc: 'For companies that want privacy-respecting music for their workspace without surveillance.',
    details: [
      'No employee listening data collection',
      'Multi-user sync available',
      'Shared playlists for teams',
      'Privacy-compliant deployment'
    ]
  },
  {
    icon: Users,
    title: 'Open Source Advocates',
    desc: 'For communities that support transparent, community-driven software with no corporate agenda.',
    details: [
      'MIT licensed',
      'Community contributions welcome',
      'No venture capital pressure',
      'Sustainable business model'
    ]
  },
  {
    icon: Briefcase,
    title: 'Indie Music Enthusiasts',
    desc: 'For listeners who support independent artists and want transparent music discovery.',
    details: [
      'No algorithm censoring niche artists',
      'Direct artist support possible',
      'Playlist curation without dark patterns',
      'Fair discovery mechanics'
    ]
  }
];

export function UseCasesPage() {
  return (
    <LandingLayout
      title="Cantio Use Cases — Who Benefits Most?"
      description="Discover who uses Cantio: privacy advocates, developers, minimalist listeners, teams, and open source enthusiasts."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#A4C4D4] via-[#518EAC] to-[#619CA9] bg-clip-text text-transparent">
            Who Uses Cantio?
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Cantio serves music lovers with different values. Here are the people and teams who benefit most.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="p-8 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 hover:border-[#518EAC]/50 rounded-lg transition">
              <div className="flex items-start gap-4">
                <useCase.icon className="w-8 h-8 text-[#518EAC] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-gray-400 mb-4">{useCase.desc}</p>
                  <ul className="space-y-2">
                    {useCase.details.map((detail, i) => (
                      <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#518EAC] rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-12 text-center">Common Scenarios</h2>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0F4C6C]/20 to-[#619CA9]/20 border border-[#518EAC]/20 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Scenario 1: The Privacy Advocate</h3>
            <p className="text-gray-300 mb-3">
              Sarah uses Spotify but hates that all her listening data is tracked and used for targeted ads. She discovers Cantio and can finally listen to music the way she wants—without surveillance. She uses it in guest mode most of the time, but occasionally logs in to sync her likes across devices.
            </p>
            <p className="text-sm text-[#518EAC]">Why Cantio? Zero tracking. Optional sync. Full control.</p>
          </div>

          <div className="bg-gradient-to-r from-[#0F4C6C]/20 to-cyan-900/20 border border-[#619CA9]/20 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Scenario 2: The Developer</h3>
            <p className="text-gray-300 mb-3">
              Marcus is building a music recommendation engine and wants to study how Cantio integrates with YouTube Music's API. He clones the repo, reads the code, runs it locally, and even contributes improvements to the project. He loves the transparency and learns best practices.
            </p>
            <p className="text-sm text-[#619CA9]">Why Cantio? Open source. Auditable. Community-driven.</p>
          </div>

          <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Scenario 3: The Design Team</h3>
            <p className="text-gray-300 mb-3">
              A 5-person UX design team wants music playing during brainstorming sessions. They use Cantio on a shared account, create team playlists, and enjoy music without the distraction of algorithmic recommendations or push notifications. No trackers, no data collection.
            </p>
            <p className="text-sm text-cyan-400">Why Cantio? Team sync. No tracking. No distractions.</p>
          </div>
        </div>
      </section>

      {/* Why Not Others */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Cantio Instead of Alternatives?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-4 text-red-400">❌ vs. Spotify</h3>
            <ul className="space-y-2 text-gray-400">
              <li>✓ No forced account</li>
              <li>✓ Zero tracking</li>
              <li>✓ No ads (ever)</li>
              <li>✓ No premium paywall</li>
              <li>✓ Open source code</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-4 text-blue-400">❌ vs. YouTube Music</h3>
            <ul className="space-y-2 text-gray-400">
              <li>✓ Standalone app (no YouTube bloat)</li>
              <li>✓ Better privacy controls</li>
              <li>✓ Open source and auditable</li>
              <li>✓ Works offline (PWA)</li>
              <li>✓ No Google account required</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-4 text-[#518EAC]">❌ vs. Apple Music</h3>
            <ul className="space-y-2 text-gray-400">
              <li>✓ Works on Windows and Linux</li>
              <li>✓ No Apple lock-in</li>
              <li>✓ Works without subscription</li>
              <li>✓ Open source transparency</li>
              <li>✓ Community-driven development</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-4 text-[#518EAC]">❌ vs. Proprietary Players</h3>
            <ul className="space-y-2 text-gray-400">
              <li>✓ Fully auditable code</li>
              <li>✓ No hidden data collection</li>
              <li>✓ Community can contribute</li>
              <li>✓ Transparent business model</li>
              <li>✓ Forever free promise</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center bg-gray-900/50 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Is Cantio Right for You?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          If you value privacy, prefer open source, or just want to listen to music without tracking, the answer is yes.
        </p>
        <a href="/" className="inline-block px-8 py-3 bg-[#518EAC] hover:bg-[#619CA9] rounded-lg font-semibold transition">
          Try Cantio Now
        </a>
      </section>
    </LandingLayout>
  );
}
