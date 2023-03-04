const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");
var express = require('express');

const bot = new Bot("5527167347:AAFg51t0sd4lTYYLJndy7C1XhgKEdj4YoiE");
var router = express.Router();


const chatId = 'USER_CHAT_ID';
const message = 'Choose an option:';


bot.start();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.post('/bot', function(req, res, next) {

  const link = req.body.link;
  const id = req.body.id;
  // telegram space 이름 - telegram space 링크 형태로 저장 
  const Space = {
    "tonicspace": "https://t.me/+65Y6saAMWtljNDFl",
    "toniclounge": "www.naver.com",
  }

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '💎 Enter Lounge',
          url: Space[link],
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
  res.render('index', { title: 'Express' });
});


module.exports = router;
