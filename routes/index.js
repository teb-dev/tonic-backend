const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");
const {loungesData } = require("../data/data");
const TelegramBot = require('node-telegram-bot-api');

var express = require('express');

const bot = new Bot("5527167347:AAFg51t0sd4lTYYLJndy7C1XhgKEdj4YoiE");
//const bot = new TelegramBot('5527167347:AAFg51t0sd4lTYYLJndy7C1XhgKEdj4YoiE', { polling: true });
var router = express.Router();


const chatId = 'USER_CHAT_ID';
const message = 'Choose an option:';


bot.start();
bot.command("start", (ctx) => ctx.reply(ctx.match));

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.post('/bot', function(req, res, next) {

  const index = req.body.link;
  const id = req.body.id;
  // telegram space 이름 - telegram space 링크 형태로 저장 
  //"https://t.me/TonicLoungeBot?start=awesome-channel-post-12345"
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '💎 Enter Lounge',
          url: 'https://t.me/TonicLoungeBot?start=awesome-channel-post-12345'
          //url: loungesData[index]["redirectUrl"],
        }
      ]
    ]
  };
  //1814305660
  bot.api.sendMessage(
    id,
    `[Tonic Lounge] 🐤 Please Click button below to Enter your private Community Space:"`,
    { reply_markup: inlineKeyboard },
  );
  res.setHeader('Access-Control-Allow-origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('ok');
});

router.get('/api/lounges', function(req, res, next) {
      const page = req.query.page;
      const SelectedItems = loungesData.slice((page-1)*5, (page)*5);
      console.log(SelectedItems);
      res.send({
        data: SelectedItems,
      })
})


module.exports = router;
