const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://example.com'; // Replace with the URL of the website you want to scrape

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const texts = [];
    const images = [];

    $('p').each(function() { // For text, assuming texts are in <p> tags
      texts.push($(this).text());
    });

    $('img').each(function() { // For images
      images.push($(this).attr('src'));
    });

    console.log('Texts:', texts);
    console.log('Images:', images);
  })
  .catch(console.error);
