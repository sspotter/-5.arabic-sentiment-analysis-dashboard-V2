import React from 'react';
import { Smile, Frown, Meh, TrendingUp, Pause, Play, XCircle, AlertTriangle } from 'lucide-react';
import { AnalysisStats } from '../types';
import { cn } from './FileUpload';

interface AnalysisProgressProps {
  stats: AnalysisStats;
  isMerging?: boolean;
  newBatchTotal?: number;
  status?: 'idle' | 'running' | 'paused' | 'error' | 'finished';
  errorMessage?: string | null;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export function AnalysisProgress({ 
  stats, 
  isMerging, 
  newBatchTotal,
  status = 'running',
  errorMessage,
  onPause,
  onResume,
  onCancel
}: AnalysisProgressProps) {
  const progressPercent = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'negative': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'neutral': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  };

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };

  return (
    <div className="w-full space-y-6">
      {status === 'error' && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-start space-x-3 text-rose-500 animate-in fade-in duration-300">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-lg">Analysis Paused Due To Error</h4>
            <p className="text-rose-400 mt-1">{errorMessage || 'The server encountered an issue.'}</p>
            <p className="text-sm mt-2 text-rose-400/80">Please ensure the local model server is running and try resuming.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">
              {isMerging 
                ? `Analyzing ${newBatchTotal} new comments... (${stats.processed} of ${stats.total} total)`
                : `Processing comment ${stats.processed} of ${stats.total}...`
              }
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-purple-400">
                {progressPercent.toFixed(1)}%
              </span>
              {status === 'paused' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Paused
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {status === 'running' && (
              <button
                onClick={onPause}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
            
            {(status === 'paused' || status === 'error') && (
              <button
                onClick={onResume}
                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            {(status === 'running' || status === 'paused' || status === 'error') && (
              <button
                onClick={onCancel}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              "h-3 rounded-full transition-all duration-300 ease-out",
              status === 'paused' || status === 'error' 
                ? "bg-amber-400 dark:bg-amber-500 opacity-60" 
                : "bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Positive"
          value={stats.positive}
          icon={<Smile className="w-6 h-6 text-emerald-400" />}
          bgColor="bg-emerald-500/10"
          textColor="text-emerald-400"
        />
        <MetricCard
          title="Negative"
          value={stats.negative}
          icon={<Frown className="w-6 h-6 text-rose-400" />}
          bgColor="bg-rose-500/10"
          textColor="text-rose-400"
        />
        <MetricCard
          title="Neutral"
          value={stats.neutral}
          icon={<Meh className="w-6 h-6 text-amber-400" />}
          bgColor="bg-amber-500/10"
          textColor="text-amber-400"
        />
        <MetricCard
          title="Sentimental Score"
          value={stats.currentScore.toFixed(3)}
          icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
          bgColor="bg-purple-500/10"
          textColor="text-purple-400"
        />
      </div>

      {stats.currentComment && (
        <div className={cn(
          "p-6 rounded-2xl border-l-4 transition-colors duration-300",
          getSentimentColor(stats.currentComment.sentiment)
        )}>
          <h4 className="font-bold mb-2 flex items-center space-x-2">
            <span>Currently analyzing:</span>
          </h4>
          <p className="italic mb-4 text-lg">
            {stats.currentComment.text.length > 150 
              ? `${stats.currentComment.text.substring(0, 150)}...` 
              : stats.currentComment.text}
          </p>
          <div className="flex items-center space-x-2 font-bold uppercase text-sm tracking-wider">
            <span>Sentiment:</span>
            <span>{stats.currentComment.sentiment}</span>
            <span className="text-xl">{getSentimentEmoji(stats.currentComment.sentiment)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, bgColor, textColor }: { title: string, value: string | number, icon: React.ReactNode, bgColor: string, textColor: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
      <div className={cn("p-3 rounded-xl", bgColor)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className={cn("text-2xl font-bold", textColor)}>{value}</p>
      </div>
    </div>
  );
}
