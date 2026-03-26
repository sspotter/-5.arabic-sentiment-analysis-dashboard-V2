import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Read the old sentiment data
const dataPath = path.join(__dirname, 'src', 'data', 'old_sentiment.json');
let rawData;
try {
  rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error("Could not read src/data/old_sentiment.json. Make sure the file exists.");
  process.exit(1);
}

const comments = rawData.comments || [];

// Process comments for chart (group by day and average)
const grouped = {};
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
    grouped[timestamp] = { sum: 0, count: 0 };
  }
  
  let score = 0;
  if (c.sentiment === 'positive') score = c.score || 0;
  else if (c.sentiment === 'negative') score = -(c.score || 0);

  grouped[timestamp].sum += score;
  grouped[timestamp].count += 1;
});

// Format as [x, y] array for Highcharts
const chartData = Object.entries(grouped)
  .map(([tsStr, data]) => {
    const timestamp = parseInt(tsStr, 10);
    const avg = data.sum / data.count;
    return [timestamp, parseFloat(avg.toFixed(3))];
  })
  .sort((a, b) => a[0] - b[0]);

app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sentiment Trend Test (Node.js)</title>
  <script src="https://code.highcharts.com/stock/highstock.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
    .chart-container { background: #1e293b; padding: 24px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); border: 1px solid #334155; }
    #container { height: 500px; width: 100%; }
    h1 { margin-top: 0; font-size: 24px; color: #f8fafc; }
    p.subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="chart-container">
    <h1>Sentiment Trend Over Time</h1>
    <p class="subtitle">Standalone Node.js Server Test</p>
    <div id="container"></div>
  </div>

  <script>
    const data = ${JSON.stringify(chartData)};
    const posColor = '#10b981';
    const neuColor = '#f59e0b';
    const negColor = '#f43f5e';
    const mainColor = '#6366f1';
    
    Highcharts.stockChart('container', {
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent',
        style: { fontFamily: "'Inter', sans-serif" }
      },
      rangeSelector: {
        enabled: true,
        selected: 1,
        inputEnabled: false,
        buttonTheme: {
          fill: 'none',
          stroke: 'none',
          r: 8,
          style: { color: '#94a3b8', fontWeight: 'bold' },
          states: {
            hover: { fill: '#334155', style: { color: '#f8fafc' } },
            select: { fill: mainColor, style: { color: '#fff' } }
          }
        }
      },
      navigator: {
        maskFill: 'rgba(99, 102, 241, 0.15)',
        outlineColor: '#334155',
        series: { color: mainColor, fillColor: 'transparent' }
      },
      scrollbar: {
        barBackgroundColor: '#1e293b',
        barBorderRadius: 4,
        trackBackgroundColor: 'transparent',
        trackBorderWidth: 0
      },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 1,
        gridLineColor: 'rgba(255,255,255,0.05)',
        labels: { style: { color: '#94a3b8' } }
      },
      yAxis: {
        opposite: false,
        min: -1.2, max: 1.2,
        tickPositions: [-1, 0, 1],
        plotLines: [{ value: 0, color: '#94a3b8', width: 1, dashStyle: 'Dash', opacity: 0.3 }],
        gridLineColor: 'rgba(255,255,255,0.05)',
        plotBands: [
          { from: 0.2, to: 1.1, color: 'rgba(16, 185, 129, 0.08)' },
          { from: -0.2, to: 0.2, color: 'rgba(245, 158, 11, 0.08)' },
          { from: -1.1, to: -0.2, color: 'rgba(244, 63, 94, 0.08)' }
        ],
        labels: {
          style: { color: '#94a3b8' },
          formatter: function() {
            if (this.value === 1) return 'Positive😊';
            if (this.value === 0) return 'Neutral😐';
            if (this.value === -1) return 'Negative😞';
            return '';
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderColor: '#334155',
        style: { color: '#f8fafc' },
        pointFormatter: function() {
          let sentiment = 'Neutral';
          let color = neuColor;
          if (this.y > 0.2) { sentiment = 'Positive'; color = posColor; }
          else if (this.y < -0.2) { sentiment = 'Negative'; color = negColor; }
          
          return '<span style="color:' + color + '">\\u25CF</span> Score: <b>' + this.y.toFixed(2) + '</b> (' + sentiment + ')<br/>';
        }
      },
      series: [{
        name: 'Daily Average Sentiment',
        data: data,
        type: 'areaspline',
        color: mainColor,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(99, 102, 241, 0.4)'],
            [1, 'rgba(99, 102, 241, 0.0)']
          ]
        },
        negativeColor: negColor,
        negativeFillColor: {
          linearGradient: { x1: 0, y1: 1, x2: 0, y2: 0 },
          stops: [
            [0, 'rgba(244, 63, 94, 0.4)'],
            [1, 'rgba(244, 63, 94, 0.0)']
          ]
        },
        threshold: 0,
        marker: {
          enabled: true,
          radius: 4,
          fillColor: mainColor,
          lineColor: '#1e293b',
          lineWidth: 2
        }
      }]
    });
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

app.listen(port, () => {
  console.log(\`\n=========================================\`);
  console.log(\`🚀 Test server running at http://localhost:\${port}\`);
  console.log(\`=========================================\n\`);
});
