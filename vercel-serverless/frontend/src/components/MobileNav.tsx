import { Home, Search, Heart, Music2, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/playlists', icon: Music2, label: 'Library' },
    { path: '/blends', icon: Users, label: 'Blends' },
    { path: '/liked', icon: Heart, label: 'Liked' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-14 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 touch-target active:bg-white/5"
            >
              <Icon 
                size={18}
                className={`mb-1 transition-colors ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span 
                className={`text-[8px] xs:text-[9px] transition-colors ${
                  isActive ? 'text-white font-medium' : 'text-white/40'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
