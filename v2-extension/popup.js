const STORAGE_KEY = 'filterKeywords';

const filterInput = document.getElementById('filterInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const scanBtn = document.getElementById('scanBtn');
const webScrapeBtn = document.getElementById('webScrapeBtn');
const filtersList = document.getElementById('filtersList');
const statusMessage = document.getElementById('statusMessage');
const scraperHealthText = document.getElementById('scraperHealth');
const lastModeText = document.getElementById('lastMode');
const lastStatsText = document.getElementById('lastStats');

let scraperIsOnline = false;

function normalizeKeyword(value) {
  return String(value || '').trim().toLowerCase();
}

function setStatus(message) {
  statusMessage.textContent = message;
  window.setTimeout(() => {
    if (statusMessage.textContent === message) {
      statusMessage.textContent = '';
    }
  }, 2400);
}

async function loadKeywords() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
}

async function saveKeywords(keywords) {
  await chrome.storage.local.set({ [STORAGE_KEY]: keywords });
}

function renderKeywords(keywords) {
  filtersList.innerHTML = '';

  if (!keywords.length) {
    const li = document.createElement('li');
    li.textContent = 'No keywords yet';
    filtersList.appendChild(li);
    return;
  }

  keywords.forEach((keyword) => {
    const li = document.createElement('li');

    const text = document.createElement('span');
    text.textContent = keyword;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      const current = await loadKeywords();
      const next = current.filter((item) => item !== keyword);
      await saveKeywords(next);
      renderKeywords(next);
      setStatus('Keyword removed');
      await requestRefreshAnalysis();
    });

    li.appendChild(text);
    li.appendChild(removeBtn);
    filtersList.appendChild(li);
  });
}

async function addKeyword() {
  const keyword = normalizeKeyword(filterInput.value);
  if (!keyword) {
    setStatus('Enter a keyword first');
    return;
  }

  const current = await loadKeywords();
  if (current.includes(keyword)) {
    setStatus('Duplicate keyword');
    return;
  }

  const next = [...current, keyword];
  await saveKeywords(next);
  renderKeywords(next);
  filterInput.value = '';
  setStatus('Keyword saved');
  await requestRefreshAnalysis();
}

async function clearKeywords() {
  await saveKeywords([]);
  renderKeywords([]);
  setStatus('All keywords cleared');
  await requestRefreshAnalysis();
}

async function withActiveTab(callback) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  if (!activeTab?.id) {
    setStatus('No active tab found');
    return;
  }

  await callback(activeTab.id);
}

async function requestStartAnalysis() {
  await withActiveTab(async (tabId) => {
    await chrome.tabs.sendMessage(tabId, { action: 'startAnalysis' });
    setStatus('Scan started on current tab');
    lastModeText.textContent = 'Last mode: local metadata';
    lastStatsText.textContent = 'Last result: local scan triggered';
  });
}

async function requestRefreshAnalysis() {
  await withActiveTab(async (tabId) => {
    await chrome.tabs.sendMessage(tabId, { action: 'refreshAnalysis' });
  });
}

async function runWebScrapeScan() {
  await withActiveTab(async (tabId) => {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      setStatus('Web scrap scan not supported on this tab');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'webScrapeAnalyzeTab',
        url: tab.url
      });

      if (!response?.ok) {
        throw new Error('web_scrape_failed');
      }

      const applyResponse = await chrome.tabs.sendMessage(tabId, {
        action: 'applyBlurFromWebScrape',
        matchedImageUrls: response.matchedImageUrls || []
      });

      const keywordCount = (response.matchedKeywords || []).length;
      const imageCount = (response.matchedImageUrls || []).length;
      const blurredCount = Number(applyResponse?.blurredCount || 0);

      setStatus(`Web scrap done: ${keywordCount} keyword hit(s), ${imageCount} image hit(s)`);
      lastModeText.textContent = 'Last mode: web scrape';
      lastStatsText.textContent = `Last result: matched ${imageCount}, blurred ${blurredCount}`;
      return;
    } catch (error) {
      console.warn('web scrape mode failed, falling back to local mode', error);
      await chrome.tabs.sendMessage(tabId, { action: 'startAnalysis' });
      setStatus('Web scrap unavailable, local scan used');
      lastModeText.textContent = 'Last mode: fallback local metadata';
      lastStatsText.textContent = 'Last result: local fallback scan triggered';
    }
  });
}

async function refreshScraperHealth() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getScraperHealth' });
    scraperIsOnline = Boolean(response?.ok && response?.health?.ok);
  } catch (error) {
    scraperIsOnline = false;
  }

  scraperHealthText.textContent = `Scraper: ${scraperIsOnline ? 'online' : 'offline'}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const keywords = await loadKeywords();
  renderKeywords(keywords);
  await refreshScraperHealth();
});

filterInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addKeyword().catch((error) => {
      console.error('add keyword failed', error);
      setStatus('Failed to save keyword');
    });
  }
});

addBtn.addEventListener('click', () => {
  addKeyword().catch((error) => {
    console.error('add keyword failed', error);
    setStatus('Failed to save keyword');
  });
});

clearBtn.addEventListener('click', () => {
  clearKeywords().catch((error) => {
    console.error('clear keywords failed', error);
    setStatus('Failed to clear keywords');
  });
});

scanBtn.addEventListener('click', () => {
  requestStartAnalysis().catch((error) => {
    console.error('start scan failed', error);
    setStatus('Could not scan this tab');
  });
});

webScrapeBtn.addEventListener('click', () => {
  runWebScrapeScan().catch((error) => {
    console.error('web scrape scan failed', error);
    setStatus('Web scrap service not reachable');
    lastModeText.textContent = 'Last mode: web scrape';
    lastStatsText.textContent = 'Last result: failed';
  });
});
