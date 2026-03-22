const express = require('express');
const cors = require('cors');
const { scrapeAndAnalyzePage } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'web-scrap-service' });
});

app.post('/analyze-page', async (req, res) => {
  const { url, keywords } = req.body || {};

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  try {
    const result = await scrapeAndAnalyzePage(url, keywords);
    res.json(result);
  } catch (error) {
    console.error('scrape failed', error.message);
    res.status(500).json({
      error: 'scrape_failed',
      message: error.message || 'unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`web-scrap-service listening on http://localhost:${PORT}`);
});
