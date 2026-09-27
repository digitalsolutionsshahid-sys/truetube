import React from 'react';
import {
  Sparkles,
  Cpu,
  Globe,
  Palette,
  Video,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { ThreeDTiltCard } from './ThreeDTiltCard';

export const AboutAcademy: React.FC = () => {
  const pillars = [
    {
      icon: Cpu,
      title: 'AI Prompt Engineering',
      tag: 'Core Foundation',
      desc: 'Master communicating with and controlling advanced LLMs. Build structured prompts, role-based workflows, image/video prompts, and reusable AI systems.',
      skills: ['LLM Architectures', 'Role & Context Prompts', 'Workflow Automation', 'Reusable Systems'],
      gradient: 'from-blue-500/20 via-indigo-500/20 to-transparent',
      borderColor: 'border-blue-500/30',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      icon: Globe,
      title: 'AI Web Design',
      tag: 'High-Demand Skill',
      desc: 'Design and build modern, interactive websites using AI tools. Turn visual concepts into responsive, functional landing pages and real client-ready websites.',
      skills: ['AI-Assisted UI/UX', 'Landing Pages', 'Portfolio Sites', 'Client-Style Delivery'],
      gradient: 'from-violet-500/20 via-purple-500/20 to-transparent',
      borderColor: 'border-violet-500/30',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      icon: Palette,
      title: 'AI Graphic Design',
      tag: 'Creative Mastery',
      desc: 'Generate professional visual designs with AI: marketing posters, social media creatives, branding kits, product mockups, and high-CTR thumbnails.',
      skills: ['AI Image Generation', 'Branding & Posters', 'YouTube Thumbnails', 'Marketing Creatives'],
      gradient: 'from-fuchsia-500/20 via-pink-500/20 to-transparent',
      borderColor: 'border-fuchsia-500/30',
      badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    },
    {
      icon: Video,
      title: 'AI Content Creation',
      tag: 'Monetization Engine',
      desc: 'Produce complete multimedia content: scriptwriting, AI voice generation, video creation, short-form Reels/Shorts, and YouTube automation workflows.',
      skills: ['Script Writing', 'AI Video & Voice', 'Shorts & Reels', 'Content Monetization'],
      gradient: 'from-emerald-500/20 via-teal-500/20 to-transparent',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  const steps = [
    { step: '01', title: 'Beginner', desc: 'Understand AI from ground zero' },
    { step: '02', title: 'Master Prompts', desc: 'Control LLMs & tools with precision' },
    { step: '03', title: 'Create Designs', desc: 'Produce graphics, web layouts & media' },
    { step: '04', title: 'Build Projects', desc: 'Real live client-grade portfolio work' },
    { step: '05', title: 'Monetize', desc: 'Freelancing, income streams & clients' },
  ];

  return (
    <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* 3D Atmospheric Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-orb" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-orb" />

      {/* Main Header Card */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>About TrueLife Academy</span>
        </div>

        {/* Urdu Positioning Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Beginner سے Professional تک{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            مکمل Practical Training
          </span>
        </h2>

        {/* Urdu Slogan */}
        <p className="text-xl sm:text-2xl font-bold text-amber-400 font-serif tracking-wide pt-1">
          "آج سیکھیں، کل کمائیں"
        </p>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          TrueLife Academy is a practical AI skills academy designed to take complete beginners toward professional, income-generating AI capabilities in prompt engineering, web design, graphic design, and content creation.
        </p>
      </div>

      {/* 4 Core Pillars Grid with 3D Tilt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <ThreeDTiltCard
              key={pillar.title}
              maxTilt={6}
              scale={1.02}
              className={`p-6 sm:p-7 rounded-2xl bg-[#0D111D]/90 border ${pillar.borderColor} shadow-xl relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${pillar.gradient} rounded-full blur-2xl pointer-events-none`} />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center text-indigo-400 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pillar.badgeColor}`}>
                  {pillar.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">{pillar.desc}</p>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                {pillar.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </ThreeDTiltCard>
          );
        })}
      </div>

      {/* Student Journey Roadmap */}
      <div className="p-7 sm:p-8 rounded-3xl bg-[#0D111D] border border-[#1E293B] shadow-2xl mb-16 relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            The Student Journey
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">From Zero to Professional AI Creator</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div>
                <div className="text-xs font-mono font-bold text-indigo-400 mb-1">{item.step}</div>
                <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block text-right text-slate-600 mt-2">
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admissions & Contact Box (High-Converting 3D Card) */}
      <ThreeDTiltCard
        maxTilt={4}
        scale={1.01}
        className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0D111D] via-[#131B2E] to-[#0D111D] border border-indigo-500/40 shadow-2xl relative overflow-hidden text-center sm:text-left"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/15 via-violet-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Details Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Admissions Open • Limited Seats</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to master practical AI skills?
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              2-month intensive program designed for beginners. Learn through live projects, build an impressive portfolio, and gain practical pathways toward freelancing and online income.
            </p>

            {/* Course Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>2 Months Duration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>3 Classes / Week (24 Total)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 col-span-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Muhallah Muhammadia, Ahmadpur Sial</span>
              </div>
            </div>
          </div>

          {/* Action CTAs Column */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* WhatsApp CTA (03331200038) */}
            <a
              href="https://wa.me/923331200038?text=Hello%20TrueLife%20Academy%20Team,%20I%20would%20like%20to%20inquire%20about%20admissions."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all active:scale-95 group"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>WhatsApp: 0333-1200038</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Facebook Page CTA */}
            <a
              href="https://web.facebook.com/TrueLifeAcademyOfficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#4c9bfd] border border-[#1877F2]/40 font-medium text-sm transition-all hover:text-white"
            >
              <span>TrueLife Academy Official Facebook</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Direct Call / Additional Contact */}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Call: 0304-0501400 / 0333-1200038</span>
            </div>
          </div>
        </div>
      </ThreeDTiltCard>
    </section>
  );
};
