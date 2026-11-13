import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface LandingLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  ogImage?: string;
}

export function LandingLayout({ children, title, description, ogImage }: LandingLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    // Update page title and meta tags for SEO
    document.title = `${title} — Cantio`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    if (ogImage) {
      document.querySelector('meta[property="og:image"]')?.setAttribute('content', ogImage);
    }
    
    // Update canonical URL
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://music.akshayka.dev${location.pathname}`);

    // Scroll to top
    window.scrollTo(0, 0);
  }, [title, description, ogImage, location.pathname]);

  return (
    <div className="min-h-screen bg-[#010101] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#010101]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/landing" className="flex items-center space-x-2 font-bold text-xl hover:text-[#518EAC] transition">
              <span className="text-[#518EAC]">♪</span>
              <span>Cantio</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <Link to="/landing/features" className="hover:text-[#518EAC] transition">Features</Link>
              <Link to="/landing/use-cases" className="hover:text-[#518EAC] transition">Use Cases</Link>
              <Link to="/landing/comparison" className="hover:text-[#518EAC] transition">Comparison</Link>
              <Link to="/landing/faq" className="hover:text-[#518EAC] transition">FAQ</Link>
              <Link to="/landing/docs" className="hover:text-[#518EAC] transition">Docs</Link>
              <a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition">GitHub</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Cantio</h3>
              <p className="text-gray-400 text-sm">Privacy-first open source music player</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/landing/features" className="hover:text-white transition">Features</Link></li>
                <li><Link to="/landing/use-cases" className="hover:text-white transition">Use Cases</Link></li>
                <li><Link to="/" className="hover:text-white transition">Try Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/landing/docs" className="hover:text-white transition">Docs</Link></li>
                <li><Link to="/landing/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><a href="https://github.com/akshay-k-a-dev/Cantio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/landing/security" className="hover:text-white transition">Privacy & Security</Link></li>
                <li><a href="https://github.com/akshay-k-a-dev/Cantio/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">License (MIT)</a></li>
                <li><a href="mailto:auth.cantio@gmail.com" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 Cantio. Open source under MIT license.</p>
            <p>Built with React, Vite, and ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
