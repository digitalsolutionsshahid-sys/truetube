import React from 'react';
import { Zap } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-subtle bg-surface-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
          aria-label="TrueTube Home"
        >
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary font-mono flex items-center">
            True<span className="text-accent">Tube</span>
          </span>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = route === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-surface-well text-primary border border-subtle font-semibold'
                    : 'text-muted hover:text-primary hover:bg-surface-well'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / TrueLife Academy */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://web.facebook.com/TrueLifeAcademyOfficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-surface-card text-xs font-medium text-muted hover:text-primary hover:border-hover transition-colors"
            title="Made by TrueLife Academy Team"
          >
            <span className="hidden sm:inline">Made by</span>
            <span className="text-primary font-semibold">TrueLife Academy</span>
          </a>
        </div>
      </div>
    </header>
  );
};
