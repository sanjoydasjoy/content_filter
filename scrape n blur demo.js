const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the Wikipedia page
    await page.goto('https://en.wikipedia.org/wiki/German_Shepherd', {
        waitUntil: 'networkidle2'
    });

    // Apply a CSS filter to blur all images on the page
    await page.evaluate(() => {
        const images = document.getElementsByTagName('img');
        for (let img of images) {
            img.style.filter = 'blur(8px)';
        }
    });

    // Optional: Take a screenshot of the page with images blurred
    await page.screenshot({ path: 'blurred-page.png' });
  // Taking screenshot of the web page after blurring certain images

    // Close the browser
    await browser.close();
})();
