import React, { useMemo, useEffect, useState } from 'react';
// @ts-ignore
import Highcharts from 'highcharts/highstock';
// @ts-ignore
import HighchartsReact from 'highcharts-react-official';
import { CommentData } from '../types';

interface SentimentTrendChartProps {
  comments: CommentData[];
  onPointClick?: (comment: CommentData) => void;
}

export function SentimentTrendChart({ comments, onPointClick }: SentimentTrendChartProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDarkTheme(document.documentElement.classList.contains('dark'));

    // Observer for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkTheme(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!comments || comments.length === 0) return [];

    const grouped: Record<number, { sum: number; count: number; originalComments: CommentData[] }> = {};
    const fallbackBaseTime = Date.now() - (comments.length * 86400000);

    comments.forEach((c, index) => {
      let timestamp = 0;
      if (c.date) {
        const d = new Date(c.date);
        if (!isNaN(d.getTime())) {
          timestamp = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }

      if (!timestamp) {
        const d = new Date(fallbackBaseTime + index * (86400000 / Math.max(1, comments.length / 30)));
        timestamp = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      }

      if (!grouped[timestamp]) {
        grouped[timestamp] = { sum: 0, count: 0, originalComments: [] };
      }
      
      let score = 0;
      if (c.sentiment === 'positive') score = c.score;
      else if (c.sentiment === 'negative') score = -c.score;

      grouped[timestamp].sum += score;
      grouped[timestamp].count += 1;
      grouped[timestamp].originalComments.push(c);
    });

    return Object.entries(grouped)
        .map(([tsStr, data]) => {
            const timestamp = parseInt(tsStr, 10);
            const avg = data.sum / data.count;
            return {
              x: timestamp,
              y: parseFloat(avg.toFixed(3)),
              comments: data.originalComments
            };
        })
        .sort((a, b) => a.x - b.x);
  }, [comments]);

  const textColor = isDarkTheme ? '#f8fafc' : '#1e293b'; 
  const subTextColor = isDarkTheme ? '#94a3b8' : '#64748b'; 
  const gridLineColor = isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const posColor = '#10b981'; 
  const neuColor = '#f59e0b'; 
  const negColor = '#f43f5e'; 
  const mainLineColor = '#6366f1'; 
  const tooltipBg = isDarkTheme ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  const chartOptions: any = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      style: { fontFamily: "'Inter', sans-serif" },
      zoomType: 'x',
      resetZoomButton: {
        position: { align: 'right', x: -10, y: 10 },
        theme: {
          fill: isDarkTheme ? '#1e293b' : '#f1f5f9',
          stroke: isDarkTheme ? '#334155' : '#e2e8f0',
          r: 8,
          style: { color: textColor, fontSize: '12px' }
        }
      }
    },
    title: {
      text: 'Sentiment Trend Over Time',
      align: 'left',
      style: { color: textColor, fontWeight: 'bold', fontSize: '18px' }
    },
    subtitle: {
      text: 'Interactive timeline: zoom, filter by range, and click points for details',
      align: 'left',
      style: { color: subTextColor, fontSize: '13px' }
    },
    rangeSelector: {
      enabled: true,
      selected: 1,
      inputEnabled: false,
      buttonTheme: {
        fill: 'none',
        stroke: 'none',
        r: 8,
        style: { color: subTextColor, fontWeight: 'bold' },
        states: {
          hover: { fill: isDarkTheme ? '#334155' : '#f1f5f9', style: { color: textColor } },
          select: { fill: mainLineColor, style: { color: '#fff' } }
        }
      }
    },
    navigator: {
      enabled: true,
      maskFill: isDarkTheme ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
      outlineColor: isDarkTheme ? '#334155' : '#e2e8f0',
      series: { color: mainLineColor, fillColor: 'transparent' }
    },
    scrollbar: {
      enabled: true,
      barBackgroundColor: isDarkTheme ? '#1e293b' : '#f1f5f9',
      barBorderRadius: 4,
      trackBackgroundColor: 'transparent',
      trackBorderWidth: 0
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 1,
      gridLineColor: gridLineColor,
  labels: {
    style: { color: '#94a3b8' },
    formatter: function () {
      return Highcharts.dateFormat('%b', this.value); // ONLY "Feb"
    }
  },
  dateTimeLabelFormats: {
    day: '%b',
    week: '%b',
    month: '%b',
    year: '%b'
  }
      },
    yAxis: {
      opposite: false,
      title: { text: null },
      min: -1.2, max: 1.2, tickPositions: [-1, 0, 1],
      gridLineColor: gridLineColor,
      labels: {
        style: { color: subTextColor, fontSize: '12px' },
        formatter: function() {
          const val = Number(this.value);
          if (val === 1) return '😊';
          if (val === 0) return '😐';
          if (val === -1) return '😞';
          return '';
        }
      },
      plotBands: [
        { from: 0.2, to: 1.1, color: isDarkTheme ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)', label: { text: 'Positive', align: 'right', style: { color: posColor, fontSize: '11px', opacity: 0.6 } } },
        { from: -0.2, to: 0.2, color: isDarkTheme ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)', label: { text: 'Neutral', align: 'right', style: { color: neuColor, fontSize: '11px', opacity: 0.6 } } },
        { from: -1.1, to: -0.2, color: isDarkTheme ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.04)', label: { text: 'Negative', align: 'right', style: { color: negColor, fontSize: '11px', opacity: 0.6 } } }
      ],
      plotLines: [{ value: 0, color: subTextColor, width: 1, dashStyle: 'Dash', opacity: 0.3 }]
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      shadow: false,
      padding: 0,
      formatter: function (this: any) {
        const date = Highcharts.dateFormat('%A, %b %e, %Y', Number(this.x));
        const score = Number(this.y);
        let sentiment = '', sentColor = '';
        if (score > 0.2) { sentiment = 'Positive'; sentColor = posColor; }
        else if (score < -0.2) { sentiment = 'Negative'; sentColor = negColor; }
        else { sentiment = 'Neutral'; sentColor = neuColor; }

        return `
          <div style="padding: 12px; background: ${tooltipBg}; border-radius: 12px; border: 1px solid ${isDarkTheme ? '#334155' : '#e2e8f0'}; color: ${textColor}; font-family: 'Inter', sans-serif; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${date}</div>
            <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between; min-width: 140px;">
              <span style="color: ${subTextColor}">Score</span> 
              <span style="font-weight: 600">${score.toFixed(2)}</span>
            </div>
            <div style="font-size: 12px; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span style="color: ${subTextColor}">Sentiment</span> 
              <span style="font-weight: 600; color: ${sentColor};">${sentiment}</span>
            </div>
            <div style="font-size: 11px; color: ${mainLineColor}; font-weight: 600; text-align: right; border-top: 1px solid ${isDarkTheme ? '#334155' : '#f1f5f9'}; pt-2 mt-2">
              Click to view comments →
            </div>
          </div>
        `;
      }
    },
    plotOptions: {
      series: {
        cursor: 'pointer',
        marker: { 
          enabled: true,
          radius: 4, 
          lineWidth: 2, 
          lineColor: isDarkTheme ? '#1e293b' : '#fff',
          fillColor: mainLineColor
        },
        point: {
          events: {
            click: function(this: any) {
              if (onPointClick && this.comments && this.comments.length > 0) {
                // Pass the first comment or handle as needed
                onPointClick(this.comments[0]);
              }
            }
          }
        }
      }
    },
    series: [{
      name: 'Daily Average Sentiment',
      data: chartData,
      type: 'areaspline',
      color: mainLineColor,
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, isDarkTheme ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'],
          [1, 'rgba(99, 102, 241, 0.0)'],
        ]
      },
      lineWidth: 3,
      threshold: 0,
      negativeColor: negColor,
      negativeFillColor: {
        linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
        stops: [
          [0, isDarkTheme ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.2)'],
          [1, 'rgba(244, 63, 94, 0.0)']
        ]
      },
      zones: [
        { value: -0.2, color: negColor },
        { value: 0.2, color: neuColor },
        { color: posColor }
      ]
    }] as any
  };

  return (
    <div className="w-full">
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={chartOptions}
      />
    </div>
  );
}
