const puppeteer = require('puppeteer');
const youtube = require("youtube-metadata-from-url");

async function getYoutubeDataByPuppet(url){
    const youtubeVideoURL = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)(\/[^&\n\r]+)$/;
    const youtubePlaylistURL = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&]+)$/;
    let title
    let thumbnail

        if(youtubeVideoURL.test(url)) {
            const titlePath = '/html/body/div/link[2]'
            const thumbnailPath = '/html/body/div/meta[1]'
        }

        if(youtubePlaylistURL.test(url)) {
            const titlePath = '/html/body/div/link[2]'
            const thumbnailPath = '/html/body/div/meta[1]'
        }

        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            title = await page.$eval(titlePath, el => el.innerHTML);
            thumbnail = await page.$eval(thumbnailPath, el => el.innerHTML);
            console.log(data);
            await browser.close();

        } catch (error) {
            console.error(error)
        }

        return {title, thumbnail}
}

async function getYoutubeDataByMetadata(url){
    const metadata = await youtube.metadata(url);
    console.log("METADATA", metadata);
    title = metadata.title;
    thumbnail = metadata.thumbnail_url;
    
    return {title, thumbnail}
}

