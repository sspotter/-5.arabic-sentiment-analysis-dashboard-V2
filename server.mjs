npm run import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Serve highcharts locally
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/highcharts')));

// Path to data
const dataPath = path.resolve(__dirname, 'src/data/old_sentiment.json');

console.log('Loading data from:', dataPath);

if (!fs.existsSync(dataPath)) {
  console.error('ERROR: src/data/old_sentiment.json does not exist!');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const comments = rawData.comments || [];

console.log(`Loaded ${comments.length} comments.`);

// Simple grouping
const grouped = {};
comments.forEach((c) => {
  if (c.date) {
    const d = new Date(c.date);
    const ts = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    if (!grouped[ts]) grouped[ts] = { sum: 0, count: 0 };
    const score = c.sentiment === 'positive' ? (c.score || 0) : (c.sentiment === 'negative' ? -(c.score || 0) : 0);
    grouped[ts].sum += score;
    grouped[ts].count++;
  }
});

const chartData = Object.entries(grouped)
  .map(([ts, d]) => [parseInt(ts), parseFloat((d.sum / d.count).toFixed(3))])
  .sort((a, b) => a[0] - b[0]);

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Sentiment Trend</title>
        <script src="/scripts/highstock.js"></script>
        <style>body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; }</style>
      </head>
      <body>
        <h1>Sentiment Trend</h1>
        <div id="container" style="height: 400px; width: 100%;"></div>
        <script>
          Highcharts.stockChart('container', {
            series: [{ name: 'Sentiment', data: ${JSON.stringify(chartData)} }]
          });
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => console.log('Server at http://localhost:' + port));
