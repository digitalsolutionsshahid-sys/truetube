import React from 'react';
import { AlertCircle, Globe, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export type ErrorType = 'INVALID_URL' | 'UNSUPPORTED_SOURCE' | 'NETWORK_ERROR' | 'DOWNLOAD_FAILED';

interface ErrorCardProps {
  type: ErrorType;
  message?: string;
  onAction?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ type, message, onAction }) => {
  const configs = {
    INVALID_URL: {
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      title: 'Invalid URL',
      defaultMsg: 'The URL you entered is not valid. Please check and try again.',
      actionText: 'Try Again',
    },
    UNSUPPORTED_SOURCE: {
      icon: Globe,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      title: 'Unsupported Source',
      defaultMsg: 'This website is not currently supported.',
      actionText: 'View Supported Sites',
    },
    NETWORK_ERROR: {
      icon: WifiOff,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      title: 'Network Error',
      defaultMsg: 'Check your internet connection and try again.',
      actionText: 'Retry',
    },
    DOWNLOAD_FAILED: {
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      title: 'Download Failed',
      defaultMsg: 'Something went wrong during the download process.',
      actionText: 'Try Again',
    },
  };

  const cur = configs[type] || configs.DOWNLOAD_FAILED;
  const Icon = cur.icon;

  return (
    <div className="w-full max-w-lg mx-auto p-6 rounded-3xl bg-[#0D111D] border border-[#1E293B] shadow-2xl text-center animate-fadeIn">
      {/* Icon badge */}
      <div
        className={`w-14 h-14 rounded-2xl ${cur.bgColor} border flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Icon className={`w-7 h-7 ${cur.iconColor}`} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{cur.title}</h3>

      {/* Message */}
      <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
        {message || cur.defaultMsg}
      </p>

      {/* Action CTA */}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium transition-all active:scale-95 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{cur.actionText}</span>
        </button>
      )}
    </div>
  );
};

export const ErrorStatesGallery: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto px-4 py-8">
      <ErrorCard type="INVALID_URL" onAction={onRetry} />
      <ErrorCard type="UNSUPPORTED_SOURCE" onAction={onRetry} />
      <ErrorCard type="NETWORK_ERROR" onAction={onRetry} />
      <ErrorCard type="DOWNLOAD_FAILED" onAction={onRetry} />
    </div>
  );
};
