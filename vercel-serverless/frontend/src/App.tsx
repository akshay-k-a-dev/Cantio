import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { usePlayer } from './services/player';
import { useAuth } from './lib/authStore';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LikedPage } from './pages/LikedPage';
import { QueuePage } from './pages/QueuePage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { PublicPlaylistPage } from './pages/PublicPlaylistPage';
import { YTMusicDetailPage } from './pages/YTMusicDetailPage';
import { BlendsPage } from './pages/BlendsPage';
import { BlendDetailPage } from './pages/BlendDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import { TrackPage } from './pages/TrackPage';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import MobileNav from './components/MobileNav';
import MobileHeader from './components/MobileHeader';
import { BlendInviteNotifications } from './components/BlendInviteNotifications';
import DownloadPopup from './components/DownloadPopup';
import AndroidDownloadPopup from './components/AndroidDownloadPopup';
import { LandingPage } from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';

// Landing pages (SEO optimized)
import { AboutPage } from './pages/landing/AboutPage';
import { FeaturesPage } from './pages/landing/FeaturesPage';
import { UseCasesPage } from './pages/landing/UseCasesPage';
import { ComparisonPage } from './pages/landing/ComparisonPage';
import { FAQPage } from './pages/landing/FAQPage';
import { DocsPage } from './pages/landing/DocsPage';
import { SecurityPage } from './pages/landing/SecurityPage';

function AppContent() {
  const isPlayerVisible = usePlayer((state) => state.isPlayerVisible);
  
  useEffect(() => {
    // Initialize everything in sequence
    const initApp = async () => {
      // Initialize player (which initializes cache)
      await usePlayer.getState().init();
      
      // Then initialize auth from IndexedDB
      await useAuth.getState().initAuth().catch(console.error);
    };
    
    initApp();
  }, []); // Empty dependency array - only run once

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Mobile Header - Login/Profile button */}
      <MobileHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content - padding for header (top), nav + mini player (bottom) */}
        <div className={`flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black pt-16 md:pt-8 p-3 sm:p-4 md:p-8 ${isPlayerVisible ? 'pb-32 md:pb-24' : 'pb-16 md:pb-4'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/liked" element={<LikedPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/track/:videoId" element={<TrackPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
            <Route path="/public/playlist/:id" element={<PublicPlaylistPage />} />
            <Route path="/ytmusic/:type/:id" element={<YTMusicDetailPage />} />
            <Route path="/blends" element={<BlendsPage />} />
            <Route path="/blends/:id" element={<BlendDetailPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/p/:slug" element={<PublicPlaylistPage />} />
          </Routes>
        </div>
      </div>

      {/* Mobile Navigation - Always visible on mobile */}
      <MobileNav />
      
      {/* Player Bar - Only when playing */}
      {isPlayerVisible && <PlayerBar />}
      
      {/* Blend Invite Notifications */}
      <BlendInviteNotifications />
      
      {/* Download Popup - First visit only */}
      <DownloadPopup />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing pages — full-page, no app shell */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landing/about" element={<AboutPage />} />
        <Route path="/landing/features" element={<FeaturesPage />} />
        <Route path="/landing/use-cases" element={<UseCasesPage />} />
        <Route path="/landing/comparison" element={<ComparisonPage />} />
        <Route path="/landing/faq" element={<FAQPage />} />
        <Route path="/landing/docs" element={<DocsPage />} />
        <Route path="/landing/security" element={<SecurityPage />} />
        {/* Everything else — uses the normal app layout */}
        <Route path="/*" element={<AppContent />} />
      </Routes>
      <Analytics />
      <AndroidDownloadPopup />
    </BrowserRouter>
  );
}
