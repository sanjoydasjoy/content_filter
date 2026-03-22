const BLUR_CLASS = 'content-filter-v2-blur';
let observerStarted = false;

function ensureStyleTag() {
  if (document.getElementById('content-filter-v2-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'content-filter-v2-style';
  style.textContent = `
    .${BLUR_CLASS} {
      filter: blur(12px) !important;
      transition: filter 0.2s ease;
    }
  `;

  document.documentElement.appendChild(style);
}

function toImageMetadata(img) {
  const src = img.currentSrc || img.src || '';
  const parts = src.split('/');
  const fileName = parts.length ? parts[parts.length - 1] : '';

  return {
    src,
    alt: img.alt || '',
    title: img.title || '',
    ariaLabel: img.getAttribute('aria-label') || '',
    fileName
  };
}

function analyzeAndApply(img) {
  if (!(img instanceof HTMLImageElement)) {
    return;
  }

  if (img.dataset.contentFilterV2Processed === '1') {
    return;
  }

  img.dataset.contentFilterV2Processed = '1';
  const image = toImageMetadata(img);

  chrome.runtime.sendMessage({ action: 'analyzeImage', image }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('content script message error', chrome.runtime.lastError.message);
      return;
    }

    if (response?.shouldBlur) {
      img.classList.add(BLUR_CLASS);
    } else {
      img.classList.remove(BLUR_CLASS);
    }
  });
}

function scanExistingImages() {
  document.querySelectorAll('img').forEach((img) => analyzeAndApply(img));
}

function observeNewImages() {
  if (observerStarted) {
    return;
  }
  observerStarted = true;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLImageElement) {
          analyzeAndApply(node);
          continue;
        }

        if (node instanceof Element) {
          node.querySelectorAll('img').forEach((img) => analyzeAndApply(img));
        }
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function reprocessAll() {
  document.querySelectorAll('img').forEach((img) => {
    delete img.dataset.contentFilterV2Processed;
  });
  scanExistingImages();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.action === 'startAnalysis') {
    reprocessAll();
    sendResponse({ started: true });
  }

  if (request?.action === 'refreshAnalysis') {
    reprocessAll();
    sendResponse({ refreshed: true });
  }
});

ensureStyleTag();
scanExistingImages();
observeNewImages();
