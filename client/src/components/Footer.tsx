import React from 'react';
import { Zap, Sparkles, MessageCircle, MapPin, Heart } from 'lucide-react';
import { useRouter } from '../router/useRouter';

export const Footer: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#07090E] pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1E293B]">
          {/* Logo & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 cursor-pointer group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white fill-white/30" />
              </div>
              <span className="text-lg font-bold text-white font-mono">
                True<span className="text-indigo-400">Tube</span>
              </span>
            </button>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Download the web. Your way.
            </span>
          </div>

          {/* TrueLife Academy Team Badge & WhatsApp */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://web.facebook.com/TrueLifeAcademyOfficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-all shadow-sm shadow-indigo-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Made by</span>
              <span className="text-white font-bold underline decoration-indigo-400 underline-offset-2">
                TrueLife Academy Team
              </span>
            </a>

            <a
              href="https://wa.me/923331200038?text=Hi%20TrueLife%20Academy%2C%20I%20have%20an%20inquiry%20regarding%20courses."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-600/20 transition-all shadow-sm shadow-emerald-500/10"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: 03331200038</span>
            </a>
          </div>

          {/* Page Links */}
          <div className="flex items-center flex-wrap justify-center gap-5 text-xs text-slate-400">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => navigateTo('faq')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => navigateTo('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About Academy
            </button>
            <a
              href="https://web.facebook.com/TrueLifeAcademyOfficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Academy Mission & Location Banner */}
        <div className="py-6 border-b border-[#1E293B]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              TrueLife Academy — Practical AI Training for Real Income
            </p>
            <p className="text-slate-400 text-[11px]">
              Prompt Engineering • AI Web Design • AI Graphic Design • AI Content Creation • "آج سیکھیں، کل کمائیں"
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ahmadpur Sial, Pakistan</span>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} TrueTube. All rights reserved. Made with{' '}
            <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> by TrueLife Academy.
          </p>
          <p className="max-w-md">
            Please respect creator copyright. TrueTube is intended for personal media backups and legally authorized downloads.
          </p>
        </div>
      </div>
    </footer>
  );
};
