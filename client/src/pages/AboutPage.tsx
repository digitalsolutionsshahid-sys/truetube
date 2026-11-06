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

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Cpu,
      title: 'AI Prompt Engineering',
      tag: 'Core Foundation',
      desc: 'Master communicating with and controlling advanced LLMs. Build structured prompts, role-based workflows, image/video prompts, and reusable AI systems.',
      skills: ['LLM Architectures', 'Role & Context Prompts', 'Workflow Automation', 'Reusable Systems'],
    },
    {
      icon: Globe,
      title: 'AI Web Design',
      tag: 'Technical Delivery',
      desc: 'Design and build modern, interactive websites using AI tools. Turn visual concepts into responsive, functional landing pages and real client-ready websites.',
      skills: ['AI-Assisted UI/UX', 'Landing Pages', 'Portfolio Sites', 'Client-Style Delivery'],
    },
    {
      icon: Palette,
      title: 'AI Graphic Design',
      tag: 'Visual Assets',
      desc: 'Generate professional visual designs with AI: marketing posters, social media creatives, branding kits, product mockups, and high-CTR thumbnails.',
      skills: ['AI Image Generation', 'Branding & Posters', 'YouTube Thumbnails', 'Marketing Creatives'],
    },
    {
      icon: Video,
      title: 'AI Content Creation',
      tag: 'Media Production',
      desc: 'Produce complete multimedia content: scriptwriting, AI voice generation, video creation, short-form Reels/Shorts, and YouTube automation workflows.',
      skills: ['Script Writing', 'AI Video & Voice', 'Shorts & Reels', 'Content Monetization'],
    },
  ];

  const steps = [
    { step: '01', title: 'Beginner', desc: 'Understand AI fundamentals from ground zero' },
    { step: '02', title: 'Master Prompts', desc: 'Control LLMs and tools with precision' },
    { step: '03', title: 'Create Designs', desc: 'Produce graphics, web layouts, and media' },
    { step: '04', title: 'Build Projects', desc: 'Build client-grade portfolio work' },
    { step: '05', title: 'Monetize', desc: 'Freelancing, income streams, and clients' },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fadeIn">
      {/* Main Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-well border border-subtle text-xs font-medium text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>TrueLife Academy Official</span>
        </div>

        {/* English Positioning Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight leading-tight">
          From Beginner to Professional: Complete Practical Training
        </h1>

        {/* Authentic Urdu Slogan */}
        <p className="text-xl sm:text-2xl font-bold text-amber-400 font-serif pt-1">
          "آج سیکھیں، کل کمائیں"
        </p>

        <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl mx-auto">
          TrueLife Academy is a practical AI skills academy designed to take complete beginners toward professional, income-generating capabilities in prompt engineering, web design, graphic design, and content creation.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-subtle hover:border-hover transition-colors shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-well border border-subtle flex items-center justify-center text-accent">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-well text-muted border border-subtle">
                  {pillar.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-primary mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-subtle">
                <span className="text-xs font-medium text-muted block mb-2">
                  Skills covered:
                </span>
                <div className="flex flex-wrap gap-2">
                  {pillar.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-well border border-subtle text-xs text-muted"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Progression Roadmap */}
      <div className="p-8 sm:p-10 rounded-2xl bg-surface-card border border-subtle shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-medium text-muted block mb-2">
            Curriculum Pathway
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-primary">
            From Zero to Paid AI Creator
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-2">
            A step-by-step practical pathway designed for beginners with no prior technical background.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="p-5 rounded-xl bg-surface-well border border-subtle text-center relative hover:border-hover transition-colors"
            >
              <div className="text-2xl font-bold font-mono text-accent mb-2">
                {item.step}
              </div>
              <h4 className="text-sm font-semibold text-primary mb-1">{item.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-faint">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Program Details & Schedule Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface-card border border-subtle flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-well border border-subtle flex items-center justify-center text-accent flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">Course Duration</h4>
            <p className="text-xs text-muted mt-0.5">2 Months Comprehensive Program</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-card border border-subtle flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-well border border-subtle flex items-center justify-center text-accent flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">Weekly Schedule</h4>
            <p className="text-xs text-muted mt-0.5">3 Classes / Week • 24 Practical Sessions</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-card border border-subtle flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-well border border-subtle flex items-center justify-center text-accent flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">Campus Location</h4>
            <p className="text-xs text-muted mt-0.5">Ahmadpur Sial, Punjab, Pakistan</p>
          </div>
        </div>
      </div>

      {/* Contact & Enrollment Banner */}
      <div className="p-8 sm:p-12 rounded-2xl bg-surface-card border border-subtle text-center space-y-6 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-well text-muted border border-subtle inline-block">
            Start Your Journey
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Connect With TrueLife Academy
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Contact us directly on WhatsApp or follow our official Facebook page to learn about upcoming batches and course enrollments.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/923331200038?text=Hello%20TrueLife%20Academy%20Team%2C%20I%20am%20interested%20in%20learning%20more%20about%20your%20AI%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (03331200038)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Facebook Official Page */}
          <a
            href="https://web.facebook.com/TrueLifeAcademyOfficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Facebook Official Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Call Direct */}
          <a
            href="tel:03331200038"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-well border border-subtle hover:border-hover text-primary font-medium text-sm transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-accent" />
            <span>Call: 03331200038</span>
          </a>
        </div>
      </div>
    </div>
  );
};
