import { Home, Search, Heart, ListMusic, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/liked', icon: Heart, label: 'Liked Songs' },
    { path: '/queue', icon: List, label: 'Queue' },
  ];

  return (
    <div className="w-64 bg-black h-full flex flex-col p-6 space-y-6">
      {/* Logo */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">MusicMu</h1>
        <p className="text-xs text-gray-400 mt-1">Ad-Free Music Streamer</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={24} />
                <span className="font-semibold">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
        <p>Guest Mode Active</p>
        <p className="mt-1">Data saved locally</p>
      </div>
    </div>
  );
}
