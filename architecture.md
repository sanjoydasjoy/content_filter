# Updated Architecture

Provide safer browsing by blurring image content based on user keywords, with optional web scraping support.

## High-Level Flow

User -> Popup (V2)
  -> Save keywords in chrome.storage.local
  -> Choose scan mode:
     1) Local metadata scan
     2) Web scrap scan

Local metadata scan:
Popup -> Content Script -> Background
  -> Check image metadata against keywords
  -> Blur matched images in the page

Web scrap scan:
Popup -> Background -> Web Scrap Service (localhost:8787)
  -> Scrape page title/text/image URLs
  -> Match keywords
  -> Return matched image URLs
  -> Content Script blurs matching images in page

```bash
Local Metadata Mode
-------------------
Popup Scan
  -> Content Script collects image metadata
  -> Background compares metadata with saved keywords
  -> Content Script adds blur class to matched images

Web Scrap Mode
--------------
Popup Web Scrap Scan
  -> Background calls localhost:8787/analyze-page
  -> Service scrapes page and finds keyword/image matches
  -> Background returns matched image URLs
  -> Content Script blurs matched images
  -> If service is offline, fallback to local metadata mode
```

## Components
- v2-extension/popup.html + popup.js + popup.css
  - User controls (add/remove/clear keywords, scan buttons)
  - Shows scraper health and last scan result

- v2-extension/content.js
  - Scans existing images
  - Watches dynamically added images (MutationObserver)
  - Applies blur class to matched images

- v2-extension/background.js
  - Central message handler
  - Loads keywords from storage
  - Supports local analyze and web-scrap analyze routes
  - Health check for scraper service

- web-scrap-service/server.js + scraper.js
  - Local Express API
  - Scrapes pages using axios + cheerio
  - Returns matched keywords and image URLs

## Tech Used
- Chrome Extension Manifest V3
- JavaScript (frontend + extension logic)
- chrome.storage.local, chrome.tabs, runtime messaging
- Node.js + Express (local web service)
- Axios + Cheerio (web scraping)

## Knowledge Added In Updated Version
- Clear separation of concerns:
  - UI layer (popup)
  - Page layer (content script)
  - Orchestration layer (background)
  - Service layer (web scraping)
- Fallback behavior:
  - If web scrap service is offline, local metadata scan still works
- Better demo clarity:
  - Health status + last scan stats visible in popup
- Legacy files preserved for historical timeline, while active work continues in V2.
