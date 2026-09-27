import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, ExternalLink } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is TrueTube?',
      a: 'TrueTube is a clean, ad-free media downloading application powered by yt-dlp and FFmpeg. It parses supported public media URLs and packages them cleanly into high-grade MP4 video or audio files.',
    },
    {
      q: 'Why does TrueTube only allow MP4 for video?',
      a: 'MP4 (utilizing the H.264 video codec and AAC audio) is the most universally compatible digital video format in existence. It plays natively on Windows, macOS, iPhones, Android devices, smart TVs, and all professional video editing software (Premiere Pro, DaVinci Resolve, CapCut) without requiring third-party codec packs.',
    },
    {
      q: 'Where do downloaded files get saved?',
      a: 'Downloads are transferred directly into your browser’s default download directory (typically your PC’s "Downloads" folder) through Chrome’s native download pipeline.',
    },
    {
      q: 'Does TrueTube store my downloaded files on the server?',
      a: 'No. To minimize server memory and protect privacy, TrueTube purges temporary stream chunks immediately upon file delivery to Chrome. Your media is never permanently stored on the server.',
    },
    {
      q: 'Can I extract high-quality audio only?',
      a: 'Yes! Switch to the "Audio" tab on the format selector to extract pristine audio tracks in MP3 (up to 320 kbps), Apple AAC (.m4a), or lossless WAV format.',
    },
    {
      q: 'What if a video fails to analyze?',
      a: 'Ensure the link is publicly accessible (not set to private, members-only, or age-restricted requiring login). You can also verify that the link begins with https:// and points directly to the video page.',
    },
    {
      q: 'Who created TrueTube?',
      a: 'TrueTube was built by the TrueLife Academy Team. TrueLife Academy is an elite practical AI training institution that trains students in prompt engineering, web development, graphic design, and content creation.',
    },
    {
      q: 'Can I get support if I encounter an issue?',
      a: 'Yes, you can directly chat with the TrueLife Academy team on WhatsApp at 03331200038 or contact us via our official Facebook page.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Support & Help</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-400">
          Everything you need to know about TrueTube downloads, formats, and privacy.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={faq.q}
              className="rounded-2xl bg-[#0D111D] border border-[#1E293B] overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-[#1E293B]/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support CTA card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0D111D] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Have questions or need assistance?</span>
          </h3>
          <p className="text-xs text-slate-400">
            Chat directly with the TrueLife Academy support team on WhatsApp.
          </p>
        </div>

        <a
          href="https://wa.me/923331200038?text=Hello%20TrueLife%20Academy%2C%20I%20have%20a%20question%20regarding%20TrueTube."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex-shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp 03331200038</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </div>
  );
};
