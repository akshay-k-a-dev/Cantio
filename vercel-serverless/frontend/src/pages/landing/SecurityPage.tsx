import { Lock, Shield, Eye, Database, AlertCircle } from 'lucide-react';
import { LandingLayout } from './LandingLayout';

export function SecurityPage() {
  return (
    <LandingLayout
      title="Cantio Privacy & Security Policy"
      description="Learn about Cantio's privacy-first approach, data handling, zero-tracking policy, and security measures."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#A4C4D4] via-[#518EAC] to-[#619CA9] bg-clip-text text-transparent">
            Privacy & Security
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your privacy is our priority. Here's exactly how Cantio handles your data.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Privacy Commitments</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gradient-to-br from-[#0F4C6C]/20 to-transparent border border-[#518EAC]/20 rounded-lg">
            <Eye className="w-8 h-8 text-[#518EAC] mb-4" />
            <h3 className="font-bold text-lg mb-3">Zero Tracking</h3>
            <p className="text-gray-400">
              No analytics, no telemetry, no behavioral tracking. We don't monitor what you listen to.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-transparent border border-cyan-500/20 rounded-lg">
            <Lock className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg mb-3">No Data Monetization</h3>
            <p className="text-gray-400">
              We never sell, share, or monetize your data. Ever. Our business model doesn't depend on it.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#0F4C6C]/20 to-transparent border border-[#619CA9]/20 rounded-lg">
            <Shield className="w-8 h-8 text-[#619CA9] mb-4" />
            <h3 className="font-bold text-lg mb-3">Open Source Transparency</h3>
            <p className="text-gray-400">
              Our code is public on GitHub. Audit it yourself and verify our privacy claims.
            </p>
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12">How We Handle Your Data</h2>
        
        <div className="space-y-8">
          <div className="border border-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-[#518EAC]" />
              Guest Mode (No Account)
            </h3>
            <p className="text-gray-300 mb-4">
              When using Cantio without an account:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li>✓ All data stays on your device</li>
              <li>✓ No server communication (except music streaming)</li>
              <li>✓ Your playlists, likes, history are local-only</li>
              <li>✓ Browser cache stores recently played songs</li>
              <li>✓ No analytics or tracking</li>
              <li>✓ Completely private listening experience</li>
            </ul>
          </div>

          <div className="border border-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-cyan-400" />
              Account Sync (Optional)
            </h3>
            <p className="text-gray-300 mb-4">
              If you create an account and enable sync:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li>✓ Liked songs stored on server (encrypted)</li>
              <li>✓ Playlists synced across devices</li>
              <li>✓ Play history available for sync</li>
              <li>✓ No behavioral analytics or profiling</li>
              <li>✓ No third-party data sharing</li>
              <li>✓ You can delete your account anytime</li>
            </ul>
          </div>

          <div className="border border-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#619CA9]" />
              What We Never Collect
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>✗ Listening behavior or timestamps</li>
              <li>✗ Device information or hardware specs</li>
              <li>✗ Location data or IP information</li>
              <li>✗ Demographic profile or interests</li>
              <li>✗ Search queries or browsing history</li>
              <li>✗ Personal identifiable information (beyond email for account)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-8">Security Measures</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Encryption</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• HTTPS/TLS for all connections</li>
              <li>• Data encrypted in transit</li>
              <li>• Passwords hashed with bcrypt</li>
              <li>• Encrypted storage for sensitive data</li>
            </ul>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Best Practices</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• Regular security audits</li>
              <li>• Dependency vulnerability scanning</li>
              <li>• No third-party trackers</li>
              <li>• Open source code review</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Rights */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Your Rights</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-[#0F4C6C]/20 border border-[#518EAC]/30 rounded-lg">
            <h3 className="font-semibold text-[#A4C4D4] mb-2">📥 Right to Access</h3>
            <p className="text-gray-300">You can download all your data from Cantio at any time.</p>
          </div>
          
          <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <h3 className="font-semibold text-cyan-300 mb-2">✏️ Right to Modify</h3>
            <p className="text-gray-300">You can edit or delete your playlists, likes, and account information anytime.</p>
          </div>
          
          <div className="p-4 bg-[#0F4C6C]/20 border border-[#619CA9]/30 rounded-lg">
            <h3 className="font-semibold text-[#A4C4D4] mb-2">🗑️ Right to Delete</h3>
            <p className="text-gray-300">Delete your account and all associated data permanently. No traces remain.</p>
          </div>
          
          <div className="p-4 bg-[#0F4C6C]/20 border border-[#518EAC]/30 rounded-lg">
            <h3 className="font-semibold text-[#A4C4D4] mb-2">📱 Data Portability</h3>
            <p className="text-gray-300">Export your playlists and liked songs in standard formats to use elsewhere.</p>
          </div>
        </div>
      </section>

      {/* Third Parties */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-y border-gray-800">
        <h2 className="text-3xl font-bold mb-8">Third-Party Services</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-lg">What We Use</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• <strong>YouTube Music API</strong> — Music streaming (not for tracking)</li>
              <li>• <strong>Vercel</strong> — Server hosting (privacy-respecting)</li>
              <li>• <strong>PostgreSQL</strong> — Database (self-managed)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-lg">What We Don't Use</h3>
            <ul className="space-y-2 text-gray-400">
              <li>• ✗ Google Analytics</li>
              <li>• ✗ Mixpanel or similar trackers</li>
              <li>• ✗ Facebook Pixel</li>
              <li>• ✗ Any third-party analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">Legal & Compliance</h2>
        
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">MIT License</h3>
            <p className="text-gray-400">
              Cantio is open source under the MIT license. You can review, fork, and modify the code.
            </p>
            <a href="https://github.com/akshay-k-a-dev/Cantio/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-[#518EAC] hover:text-[#A4C4D4] mt-2 inline-block">
              View Full License →
            </a>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">GDPR & Privacy Regulations</h3>
            <p className="text-gray-400">
              Cantio complies with GDPR, CCPA, and other privacy regulations. Since we collect minimal data, most regulations don't apply—but we follow best practices.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900/50 to-transparent border border-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">No Cookies (except authentication)</h3>
            <p className="text-gray-400">
              Cantio uses only essential cookies for authentication. No tracking cookies, no third-party cookies. You won't see cookie consent banners here.
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Transparency Report */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-8 text-center">Questions or Concerns?</h2>
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            We take privacy seriously. If you have any concerns or questions about how Cantio handles your data, please reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:auth.cantio@gmail.com" className="px-6 py-2 bg-[#518EAC] hover:bg-[#619CA9] rounded-lg transition">
              Email: auth.cantio@gmail.com
            </a>
            <a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-lg transition">
              GitHub: Cantio Repository
            </a>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
        <p>Last updated: May 2026</p>
        <p>This policy may be updated as Cantio evolves. Changes will be announced on GitHub.</p>
      </section>
    </LandingLayout>
  );
}
