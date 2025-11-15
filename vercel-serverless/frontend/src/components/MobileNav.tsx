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
    <nav className="md:hidden fixed bottom-20 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon 
                size={24} 
                className={`mb-1 ${
                  isActive ? 'text-purple-400' : 'text-gray-400'
                }`}
              />
              <span 
                className={`text-xs ${
                  isActive ? 'text-purple-400 font-semibold' : 'text-gray-400'
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
