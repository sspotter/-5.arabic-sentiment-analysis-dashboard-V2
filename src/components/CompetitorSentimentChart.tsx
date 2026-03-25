import React from 'react';
import { AnalysisStats } from '../types';

interface BrandSentimentData {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
  color?: string;
}

interface CompetitorSentimentChartProps {
  brands: BrandSentimentData[];
  title?: string;
}

export function CompetitorSentimentChart({ brands, title = "Sentiment, by Competitor" }: CompetitorSentimentChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider w-1/4">
                {title}
              </th>
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider text-center px-4">
                Sentiment Comparison
              </th>
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider text-right px-4">
                Comments
              </th>
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider text-right px-4">
                Net Score
              </th>
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider text-right px-4">
                % Pos
              </th>
              <th className="pb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider text-right pl-4">
                % Neg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {brands.map((brand, idx) => {
              const totalCount = brand.positive + brand.negative + brand.neutral;
              const posNegTotal = brand.positive + brand.negative;
              
              // Percentages for the display columns (Positive vs Negative only)
              const posPercentDisplay = posNegTotal > 0 ? (brand.positive / posNegTotal) * 100 : 0;
              const negPercentDisplay = posNegTotal > 0 ? (brand.negative / posNegTotal) * 100 : 0;
              
              // NEW BAR LOGIC: 
              // If there is ANY sentiment (Pos/Neg), only show those two in the bar.
              // If there is ZERO sentiment, and it's all neutral, show a yellow bar.
              let posWidth = 0;
              let negWidth = 0;
              let neutralWidth = 0;

              if (posNegTotal > 0) {
                posWidth = (brand.positive / posNegTotal) * 100;
                negWidth = (brand.negative / posNegTotal) * 100;
              } else if (brand.neutral > 0) {
                neutralWidth = 100;
              }

              const netScore = Math.round(posPercentDisplay - negPercentDisplay);
              const brandColor = brand.color || (idx % 2 === 0 ? '#6366f1' : '#8b5cf6');

              return (
                <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-5 pr-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: brandColor }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {brand.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 min-w-[200px]">
                    <div className="h-2.5 flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800/50">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${posWidth}%` }}
                      />
                      <div 
                        className="h-full bg-rose-500 transition-all duration-1000 ease-out"
                        style={{ width: `${negWidth}%` }}
                      />
                      <div 
                        className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                        style={{ width: `${neutralWidth}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {totalCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className={`text-sm font-bold ${netScore >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {netScore}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {Math.round(posPercentDisplay)}%
                    </span>
                  </td>
                  <td className="py-5 pl-4 text-right">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {Math.round(negPercentDisplay)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center space-x-8 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Positive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Negative</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Neutral</span>
        </div>
      </div>
    </div>
  );
}

