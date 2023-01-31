const axios = require('axios');
const cheerio = require('cheerio');
const htmlToJson = require('html-to-json');
const fs = require('fs');

async function getYoutubeTitle(url) {
    // let scrapedData;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1' 
      }
    });

    const jsonData = JSON.stringify(response.data);
    fs.writeFileSync('data.json', jsonData);
    console.log('Data saved to data.json file.');

    const $ = cheerio.load(response.data);
    const title = $("#watch7-content > meta:nth-child(2)").attr("content");
    console.log('TITLE', title);
    }

const url = 'https://youtu.be/qGpiCipPya0';
getYoutubeTitle(url);

