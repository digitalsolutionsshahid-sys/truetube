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
import { ThreeDTiltCard } from '../components/ThreeDTiltCard';

export const AboutPage: React.FC = () => {
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
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      {/* 3D Atmospheric Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-orb" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-orb" />

      {/* Main Header Card */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>TrueLife Academy Official</span>
        </div>

        {/* English Positioning Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          From Beginner to Professional{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Complete Practical Training
          </span>
        </h1>

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
              className={`p-6 sm:p-8 rounded-3xl bg-[#0D111D]/90 border ${pillar.borderColor} shadow-2xl relative overflow-hidden group hover:border-opacity-80 transition-all`}
            >
              {/* Pillar top highlight gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${pillar.badgeColor}`}
                  >
                    {pillar.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Skills Covered:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pillar.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ThreeDTiltCard>
          );
        })}
      </div>

      {/* Student Progression Roadmap */}
      <div className="mb-16 p-8 sm:p-10 rounded-3xl bg-[#0D111D] border border-[#1E293B] shadow-2xl relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2">
            The Transformation Pathway
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            From Zero to Paid AI Creator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            A clear step-by-step practical pathway designed for beginners with no prior technical background.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-[#131B2E]/60 border border-[#1E293B] text-center relative group hover:border-indigo-500/40 transition-all"
            >
              <div className="text-3xl font-extrabold font-mono text-indigo-500/30 mb-2 group-hover:text-indigo-400/60 transition-colors">
                {item.step}
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Program Details & Schedule Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-3xl bg-[#0D111D] border border-[#1E293B] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Course Duration</h4>
            <p className="text-xs text-slate-400 mt-0.5">2 Months Comprehensive Program</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111D] border border-[#1E293B] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Weekly Schedule</h4>
            <p className="text-xs text-slate-400 mt-0.5">3 Classes / Week • 24 Practical Sessions</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D111D] border border-[#1E293B] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Campus Location</h4>
            <p className="text-xs text-slate-400 mt-0.5">Ahmadpur Sial, Punjab, Pakistan</p>
          </div>
        </div>
      </div>

      {/* Contact & Enrollment Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-[#0D111D] to-purple-950/40 border border-indigo-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-block">
            Start Your Journey
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Connect With TrueLife Academy
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Contact us directly on WhatsApp or follow our official Facebook page to learn about upcoming batches and course enrollments.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/923331200038?text=Hello%20TrueLife%20Academy%20Team%2C%20I%20am%20interested%20in%20learning%20more%20about%20your%20AI%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Chat on WhatsApp (03331200038)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Facebook Official Page */}
          <a
            href="https://web.facebook.com/TrueLifeAcademyOfficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Facebook Official Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Call Direct */}
          <a
            href="tel:03331200038"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-indigo-400" />
            <span>Call: 03331200038</span>
          </a>
        </div>
      </div>
    </div>
  );
};
