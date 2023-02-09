const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
const youtube = require('youtube-metadata-from-url');
const { Keyboard, Key } = require('telegram-keyboard')
const database = require('./database.js');

const token = '';

const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (message) => {
  // return
  const youtubeURL = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)(\/[^&\n\r]+)$/;
  const myID = 183278535 
  let user_id = message.chat.id
  let message_id = message.message_id
  let user_name = message.chat.username
  let data = {user_id: user_id, message_id: message_id, user_name: user_name}

  let exists = await database.check_and_create(data) 
  if (exists){
    await database.update_last_message(data)
  }
  // return

  if(message.chat.id !== 183278535) {
    // bot.sendMessage(myID, message.text)
    await database.update_last_message(data)
    return
  }
  
  // const keyboard = Keyboard.make([
  //   Key.callback('Button 1', 'action1'),
  //   Key.callback('Button 2', 'action2'),
  //   ]).inline()

  const keyboard = Keyboard.make([
    Key.callbackWithImage('Button 1', 'action1', 'https://i.ytimg.com/vi/mgt-6PPrJzA/hqdefault.jpg')
    ]).inline()

  bot.sendMessage(183278535, message.text, keyboard)
  try {
    await database.update_last_message(data)
    await database.set_channel_id(data)
    await database.create_collection(data)

  } catch (error) {
    console.log(`ERROR WITH DATABASES ${error}`)
  }
  return
});

bot.on('channel_post', async (channelPost) => {
  // return
  let message = channelPost;  
  const myID = 183278535 

  // check if the channelPost comes from the specific channel
  if(channelPost.chat.id === -1001830200744) {

    const youtubeURL = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)(\/[^&\n\r]+)$/;
    if(youtubeURL.test(message.text)) {
      let data = await getYoutubeData(message.text)
      
      const keyboard = Keyboard.make([
        Key.callback('Добавить', 'add'),
        Key.callback('Изменить', 'edit'),
        Key.callback('Удалить', 'delete'),
      ]).inline()

      data['channel_id'] = channelPost.chat.id

      let user = await database.get_user_by_channel_id(data.channel_id)

      sendMessage(user.user_id, data.text, keyboard);
      await database.update_last_message_by_channel_id(data)
      await database.new_track(data)
    }
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;
  const message = callbackQuery.message;
  const chatId = message.chat.id;

  switch(data){
      case 'add':
          return;

      case 'edit':
          // do something with option 2
          break;

      case 'delete':
        break
      // default:
          // handle other cases
  }
});

///////////////////////////////////////////////////////

function sendMessage(chatId, text, inline_keyboard) {
  if(inline_keyboard){
    bot.sendMessage(chatId, text, inline_keyboard)
  }else{
    bot.sendMessage(chatId,text);
    }
}

async function getYoutubeData(url){
  const youtubeURL = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)(\/[^&\n\r]+)$/;
  const youtubePlaylistLink = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&]+)$/;
  let text 
  let title
  let thumbnail

    if(youtubeURL.test(url)) {
      try { 
        const metadata = await youtube.metadata(url);
        console.log('METADATA',metadata);
        title = metadata.title;
        thumbnail = metadata.thumbnail_url;
        text = `${title} \n${thumbnail}`;
        return {text, url, title, thumbnail}
  
      } catch (error) {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            }
          });
      
          const $ = cheerio.load(response.data);
          title = $("#watch7-content > meta:nth-child(2)").attr("content");
          text = `${title}`
          return {text, url, title, thumbnail}
          
        } catch (error) {
          sendMessage(userID, "ERROR")
          console.error(error);
        }
      }
    }

    if(youtubePlaylistLink.test(url)) {
      try {
        console.log(await youtube.metadata(url));
        title = (await youtube.metadata(url)).title;
        thumbnail = (await youtube.metadata(url)).thumbnail_url;
        text = `${title} \n${thumbnail}`;
        return {text, url, title, thumbnail}

      } catch (error) {
        sendMessage(userID, "ERROR")
        console.error(error);
      }
    } 
 
}
