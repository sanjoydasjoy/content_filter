# Web Scrap Service

- Scrapes a URL using `axios + cheerio`
- Extracts title, text chunks, and image URLs
- Matches those against user keywords
- Returns matched keywords and matched image URLs

## Run locally
1. `cd content_filter/web-scrap-service`
2. `npm install`
3. `npm start`

Service starts on `http://localhost:8787`.

## API
### `GET /health`
Returns service status.

### `POST /analyze-page`
Request body:
```json
{
  "url": "https://example.com",
  "keywords": ["nsfw", "adult"]
}
```

Response includes:
- `matchedKeywords`
- `matchedImageUrls`
- `shouldBlur`
- `imageCount`

## Integration
`v2-extension` calls this service when user clicks **Web Scrap Scan** in popup.
