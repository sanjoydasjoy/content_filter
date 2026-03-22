const STORAGE_KEY = 'filterKeywords';
const SCRAPER_BASE_URL = 'http://localhost:8787';
const SCRAPER_SERVICE_URL = `${SCRAPER_BASE_URL}/analyze-page`;
const SCRAPER_HEALTH_URL = `${SCRAPER_BASE_URL}/health`;

function normalizeKeyword(value) {
  return String(value || '').trim().toLowerCase();
}

async function getFilterKeywords() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  const list = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
  return list.map(normalizeKeyword).filter(Boolean);
}

function shouldBlurImageFromMetadata(metadata, keywords) {
  if (!keywords.length) {
    return false;
  }

  const candidateText = [
    metadata?.src,
    metadata?.alt,
    metadata?.title,
    metadata?.ariaLabel,
    metadata?.fileName
  ]
    .map((part) => String(part || '').toLowerCase())
    .join(' ');

  return keywords.some((keyword) => candidateText.includes(keyword));
}

async function analyzePageViaScraper(url, keywords) {
  const response = await fetch(SCRAPER_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, keywords })
  });

  if (!response.ok) {
    throw new Error(`scraper_service_error_${response.status}`);
  }

  return response.json();
}

async function getScraperHealth() {
  const response = await fetch(SCRAPER_HEALTH_URL, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`scraper_health_error_${response.status}`);
  }

  return response.json();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request?.action === 'analyzeImage') {
      const keywords = await getFilterKeywords();
      const shouldBlur = shouldBlurImageFromMetadata(request.image, keywords);
      sendResponse({ shouldBlur, keywordsUsed: keywords.length });
      return;
    }

    if (request?.action === 'getFilterKeywords') {
      const keywords = await getFilterKeywords();
      sendResponse({ keywords });
      return;
    }

    if (request?.action === 'webScrapeAnalyzeTab') {
      const keywords = await getFilterKeywords();
      const result = await analyzePageViaScraper(request.url, keywords);
      sendResponse({
        ok: true,
        mode: 'web-scrape',
        sourceUrl: result.sourceUrl,
        title: result.title || '',
        matchedKeywords: result.matchedKeywords || [],
        matchedImageUrls: result.matchedImageUrls || [],
        imageCount: result.imageCount || 0,
        shouldBlur: Boolean(result.shouldBlur)
      });
      return;
    }

    if (request?.action === 'getScraperHealth') {
      const health = await getScraperHealth();
      sendResponse({ ok: true, health });
      return;
    }

    sendResponse({ error: 'Unknown action' });
  })().catch((error) => {
    console.error('background message handler failed', error);
    sendResponse({ shouldBlur: false, error: String(error) });
  });

  return true;
});
