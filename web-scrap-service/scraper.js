const axios = require('axios');
const cheerio = require('cheerio');

function normalizeKeyword(value) {
  return String(value || '').trim().toLowerCase();
}

function toAbsoluteUrl(url, baseUrl) {
  if (!url) {
    return '';
  }

  try {
    return new URL(url, baseUrl).toString();
  } catch (error) {
    return String(url);
  }
}

function collectPageData($, pageUrl) {
  const title = $('title').first().text().trim();

  const textChunks = [];
  $('p, h1, h2, h3, figcaption, a').each((_, el) => {
    const value = $(el).text().trim();
    if (value) {
      textChunks.push(value);
    }
  });

  const imageUrls = [];
  $('img').each((_, img) => {
    const src = $(img).attr('src') || $(img).attr('data-src') || '';
    const absolute = toAbsoluteUrl(src, pageUrl);
    if (absolute) {
      imageUrls.push(absolute);
    }
  });

  return {
    title,
    pageText: textChunks.join(' '),
    imageUrls: Array.from(new Set(imageUrls))
  };
}

function analyzeByKeywords(pageData, rawKeywords) {
  const keywords = (Array.isArray(rawKeywords) ? rawKeywords : [])
    .map(normalizeKeyword)
    .filter(Boolean);

  const haystack = `${pageData.title} ${pageData.pageText}`.toLowerCase();

  const matchedKeywords = keywords.filter((keyword) => haystack.includes(keyword));

  const matchedImageUrls = pageData.imageUrls.filter((imageUrl) => {
    const candidate = imageUrl.toLowerCase();
    return keywords.some((keyword) => candidate.includes(keyword));
  });

  return {
    keywords,
    matchedKeywords,
    matchedImageUrls,
    shouldBlur: matchedKeywords.length > 0 || matchedImageUrls.length > 0
  };
}

async function scrapeAndAnalyzePage(url, keywords) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000,
    maxRedirects: 5
  });

  const html = response.data;
  const $ = cheerio.load(html);
  const pageData = collectPageData($, url);
  const analysis = analyzeByKeywords(pageData, keywords);

  return {
    sourceUrl: url,
    title: pageData.title,
    imageCount: pageData.imageUrls.length,
    ...analysis
  };
}

module.exports = {
  scrapeAndAnalyzePage
};
