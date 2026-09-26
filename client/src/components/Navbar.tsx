import React from 'react';
import { Zap } from 'lucide-react';

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

        {/* Right CTA / GitHub link */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/yt-dlp/yt-dlp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-[#0D111D] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-all hover:bg-slate-800/60"
            aria-label="GitHub Repository"
          >
            <svg className="w-4 h-4 text-slate-300 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
