import React from 'react';
import { Zap, Sparkles, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onNavClick?: (sectionId: string) => void;
  onReset?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavClick, onReset }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B] bg-[#07090E]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onReset}
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

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavClick?.('home')}
            className="px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => onNavClick?.('features')}
            className="px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => onNavClick?.('supported')}
            className="px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            Supported
          </button>
          <button
            onClick={() => onNavClick?.('faq')}
            className="px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => onNavClick?.('about')}
            className="px-3.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            About
          </button>
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
