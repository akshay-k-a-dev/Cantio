import { motion } from 'framer-motion';
import {
  Music,
  ShieldOff,
  RefreshCw,
  HardDrive,
  Layers,
  Shuffle,
  Users,
  ListMusic,
  MonitorPlay,
  Smartphone,
  Globe,
  Download,
  ChevronRight,
  Github,
  Star,
} from 'lucide-react';

// ─── Download links ───────────────────────────────────────────────────────────
const DOWNLOADS = [
  {
    label: 'Windows',
    file: 'Cantio Setup 1.0.0.exe',
    href: 'https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio.Setup.1.0.0.exe',
    gradient: 'from-blue-500 to-cyan-500',
    icon: <MonitorPlay className="w-5 h-5" />,
    available: true,
  },
  {
    label: 'Linux (Debian / Ubuntu)',
    file: 'cantio-desktop_1.0.0_amd64.deb',
    href: 'https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/cantio-desktop_1.0.0_amd64.deb',
    gradient: 'from-orange-500 to-red-500',
    icon: <MonitorPlay className="w-5 h-5" />,
    available: true,
  },
  {
    label: 'Linux (AppImage)',
    file: 'Cantio-1.0.0.AppImage',
    href: 'https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio-1.0.0.AppImage',
    gradient: 'from-green-500 to-emerald-500',
    icon: <MonitorPlay className="w-5 h-5" />,
    available: true,
  },
  {
    label: 'Android',
    file: 'Coming Soon',
    href: null,
    gradient: 'from-green-500 to-lime-500',
    icon: <Smartphone className="w-5 h-5" />,
    available: false,
  },
];

// ─── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <ShieldOff className="w-6 h-6" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    title: 'Zero tracking',
    desc: 'No analytics, no telemetry, no ads. Your listening history stays on your device.',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Optional account sync',
    desc: 'Create a free account only when you want to sync across devices. Works 100% offline otherwise.',
  },
  {
    icon: <HardDrive className="w-6 h-6" />,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'Local + streaming',
    desc: 'Stream from YouTube Music or play local files. One experience, your choice of source.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    title: 'Cross-device playlists',
    desc: 'Playlists sync instantly between web, desktop and mobile when signed in.',
  },
  {
    icon: <Shuffle className="w-6 h-6" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    title: 'Smart queue',
    desc: 'Drag-and-drop reorder, shuffle, repeat modes and a reverse history stack.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: 'Blends',
    desc: 'Merge listening tastes with friends and get a shared playlist that fits both of you.',
  },
  {
    icon: <ListMusic className="w-6 h-6" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    title: 'Liked songs & playlists',
    desc: "Full library management. Save favorites, build playlists, never lose what you loved.",
  },
  {
    icon: <Music className="w-6 h-6" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    title: 'Lyrics panel',
    desc: 'Synced lyrics display alongside playback. No extra app needed.',
  },
];

// ─── How-to steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', title: 'Open the web app', desc: 'No sign-up required. Hit "Launch App" and start searching.' },
  { num: '02', title: 'Search anything', desc: 'Songs, albums, artists, playlists — streamed from YouTube Music.' },
  { num: '03', title: 'Optional: create an account', desc: 'Sign up to sync liked songs, playlists and history across all your devices.' },
  { num: '04', title: 'Download the desktop app', desc: 'Get the native Windows or Linux app for a richer offline-first experience.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/70 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">Cantio</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/akshay-k-a-dev/Cantio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Launch App
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-24 pb-20 overflow-hidden">
        {/* background glow blobs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-pink-700/20 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            Open-source · Free forever · No ads
          </div>

          {/* headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Cantio
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Open-source, privacy-first music player
          </p>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Stream from YouTube Music, build playlists, sync across devices — all without giving up your data.
            Works in the browser, as a desktop app, and on mobile.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8 py-3.5 rounded-full text-base transition-all shadow-xl shadow-purple-900/40"
            >
              <Globe className="w-5 h-5" />
              Launch Web App
            </a>
            <a
              href="#downloads"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-full text-base transition-all"
            >
              <Download className="w-5 h-5" />
              Download Desktop
            </a>
          </div>
        </motion.div>

        {/* fake player preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-16 w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold truncate">Now Playing</p>
              <p className="text-sm text-gray-400 truncate">Your favourite artist · Album</p>
            </div>
          </div>
          {/* fake progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="h-full w-3/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>2:14</span><span>3:45</span>
          </div>
          <div className="flex justify-center items-center gap-6 mt-4 text-gray-300">
            <Shuffle className="w-4 h-4" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <RefreshCw className="w-4 h-4" />
          </div>
        </motion.div>
      </section>

      {/* ── What It Is ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">What it is</p>
              <h2 className="text-2xl font-black mb-3">A music player that respects you</h2>
              <p className="text-gray-400">Cantio streams music and organises your library without secretly selling your taste to advertisers. It's just a music player.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-3">Why it's different</p>
              <h2 className="text-2xl font-black mb-3">Open source, no paywall</h2>
              <p className="text-gray-400">No premium tier, no feature lock. Every feature — sync, playlists, Blends, lyrics — is free for everyone, forever.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">How to try it</p>
              <h2 className="text-2xl font-black mb-3">Open the web app now</h2>
              <p className="text-gray-400">No install, no sign-up required. Click "Launch App", search for a song and press play. Account creation is optional.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">What's included</p>
            <h2 className="text-3xl sm:text-4xl font-black">Everything you need. Nothing you don't.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-2xl p-5 transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to try it ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Get started</p>
            <h2 className="text-3xl sm:text-4xl font-black">Up and running in 30 seconds</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                  <span className="text-sm font-black text-purple-300">{s.num}</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <a
              href="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-xl shadow-purple-900/40"
            >
              <Globe className="w-5 h-5" />
              Launch Web App
            </a>
          </div>
        </div>
      </section>

      {/* ── Downloads ────────────────────────────────────────────── */}
      <section id="downloads" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Native apps</p>
            <h2 className="text-3xl sm:text-4xl font-black">Download the desktop app</h2>
            <p className="text-gray-400 mt-3">Electron-based. Ships with a local media engine and offline support.</p>
          </div>
          <div className="space-y-4">
            {DOWNLOADS.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                {d.available && d.href ? (
                  <a
                    href={d.href}
                    className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                        {d.icon}
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-purple-300 transition-colors">{d.label}</p>
                        <p className="text-sm text-gray-400">{d.file}</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl opacity-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                        {d.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{d.label}</p>
                        <p className="text-sm text-gray-400">{d.file}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Web App CTA row */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Web App</p>
                <p className="text-sm text-gray-400">No install required · Works on any device</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:from-purple-400 hover:to-pink-400 transition-all flex-shrink-0"
            >
              Open App
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-white">Cantio</span>
        </div>
        <p className="mb-3">Open-source music player · Free forever</p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://github.com/akshay-k-a-dev/Cantio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <a href="/" className="hover:text-white transition-colors">Launch App</a>
        </div>
      </footer>
    </div>
  );
}
