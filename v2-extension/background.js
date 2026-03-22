const STORAGE_KEY = 'filterKeywords';

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

    sendResponse({ error: 'Unknown action' });
  })().catch((error) => {
    console.error('background message handler failed', error);
    sendResponse({ shouldBlur: false, error: String(error) });
  });

  return true;
});
