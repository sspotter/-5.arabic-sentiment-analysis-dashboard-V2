import React from 'react';
import { SentimentTrendChart } from './SentimentTrendChart';
import oldSentiment from '../data/old_sentiment.json';
import { ArrowLeft, BarChart3 } from 'lucide-react';

interface TrendTestPageProps {
  onBack: () => void;
}

export function TrendTestPage({ onBack }: TrendTestPageProps) {
  // The JSON structure from old_sentiment.json has a 'comments' property
  const comments = (oldSentiment as any).comments || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-purple-500 transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-purple-500" />
              Sentiment Trend Test
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Rendering trend data from <code>old sentiment.json</code>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Test Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <SentimentTrendChart 
            comments={comments} 
            onPointClick={(comment) => console.log('Point clicked:', comment)}
          />
        </div>

        <div className="bg-slate-900/5 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{comments.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Total Comments</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-emerald-500">{(oldSentiment as any).stats?.positive || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Positive</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-rose-500">{(oldSentiment as any).stats?.negative || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Negative</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-400">{(oldSentiment as any).stats?.neutral || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Neutral</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
