import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#07090E] pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1E293B]">
          {/* Logo & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Zap className="w-4 h-4 text-white fill-white/30" />
              </div>
              <span className="text-lg font-bold text-white font-mono">
                True<span className="text-indigo-400">Tube</span>
              </span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-xs text-slate-400">Download the web. Your way.</span>
          </div>

          {/* Links */}
          <div className="flex items-center flex-wrap justify-center gap-5 text-xs text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Powered by yt-dlp badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-indigo-400">yt-dlp</span>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} TrueTube. All rights reserved.</p>
          <p className="max-w-md">
            Please respect creator copyright. TrueTube is intended for personal media backups and legally authorized downloads.
          </p>
        </div>
      </div>
    </footer>
  );
};
