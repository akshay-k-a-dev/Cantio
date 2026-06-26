import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AndroidDownloadPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Don't show in Electron app
    if ((window as any).electronAPI) {
      return;
    }

    // Check if user is on Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Check last shown time in localStorage
    const lastShown = localStorage.getItem('cantio-android-download-popup-last-shown');
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (isAndroid && (!lastShown || now - Number(lastShown) > ONE_DAY_MS)) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('cantio-android-download-popup-last-shown', Date.now().toString());
  };

  const handleDownload = () => {
    window.open('https://github.com/akshay-k-a-dev/Cantio_Mobile/releases', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          {/* Backdrop Click to close */}
          <div className="absolute inset-0" onClick={handleClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Glowing accent light */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-lime-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10"
              aria-label="Close download popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-5">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-green-900/30 ring-4 ring-green-500/10">
                <Smartphone className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                  Cantio Mobile is Here! 📱
                </h2>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  The standalone Android app is now available. Experience Cantio as a native app with background playback, notification integration, and optimized mobile performance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/40 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-5 h-5" />
                  Get Android App
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3.5 text-gray-400 hover:text-white font-semibold transition-colors bg-white/5 hover:bg-white/10 rounded-xl"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
