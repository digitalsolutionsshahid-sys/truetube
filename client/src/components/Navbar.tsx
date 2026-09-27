import React from 'react';
import { Zap, Sparkles, MessageCircle } from 'lucide-react';
import { useRouter } from '../router/useRouter';
import type { AppRoute } from '../router/routes';

export const Navbar: React.FC = () => {
  const { route, navigateTo } = useRouter();

  const navItems: { id: AppRoute; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'faq', label: 'FAQ' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B] bg-[#07090E]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-95"
          aria-label="TrueTube Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Zap className="w-5 h-5 text-white fill-white/20 transform group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
            True<span className="text-indigo-400">Tube</span>
          </span>
        </button>

        {/* Center Navigation Links (Supported button removed) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = route === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / TrueLife Academy & WhatsApp */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://web.facebook.com/TrueLifeAcademyOfficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/60 transition-all shadow-sm shadow-indigo-500/10"
            title="Made by TrueLife Academy Team"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Made by</span>
            <span className="text-white font-bold">TrueLife Academy</span>
          </a>

          <a
            href="https://wa.me/923331200038?text=Hi%20TrueLife%20Academy%2C%20I%20have%20an%20inquiry%20regarding%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-600/20 hover:border-emerald-500/60 transition-all shadow-sm shadow-emerald-500/10"
            title="Chat on WhatsApp: 03331200038"
            aria-label="WhatsApp Contact"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline font-mono font-semibold">03331200038</span>
            <span className="md:hidden font-semibold">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};
