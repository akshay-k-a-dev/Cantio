import { Home, Search, Heart, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/liked', icon: Heart, label: 'Liked' },
    { path: '/queue', icon: List, label: 'Queue' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-40">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full py-2"
            >
              <Icon 
                size={22} 
                className={`mb-0.5 transition-colors ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span 
                className={`text-[10px] transition-colors ${
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
