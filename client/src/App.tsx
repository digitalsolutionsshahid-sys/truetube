import React, { useState, useCallback } from 'react';
import { RouterProvider } from './router/RouterContext';
import { useRouter } from './router/useRouter';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { FaqPage } from './pages/FaqPage';
import { AboutPage } from './pages/AboutPage';

const AppContent: React.FC = () => {
  const { route } = useRouter();

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3800);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Navbar with Router integration */}
      <Navbar />

      {/* Main Dynamic View Area */}
      <main className="flex-1 py-4 sm:py-8">
        {route === 'home' && <HomePage addToast={addToast} />}
        {route === 'features' && <FeaturesPage />}
        {route === 'faq' && <FaqPage />}
        {route === 'about' && <AboutPage />}
      </main>

      {/* Footer with Router navigation */}
      <Footer />

      {/* Persistent Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;
