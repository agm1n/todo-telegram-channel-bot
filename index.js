const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = "YOUR_API_KEY";
const helpText = `Чтобы начать просто добавьте #todo в начале сообщение в канале и это запустит создание тудушки`;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});

bot.on('channel_post', async msg => {
  console.log(msg);
});

bot.onText(/\/help/, (msg, match) => {
  const {message_id: originalMessageId, from: {username}, chat: {id: chatId}} = msg;
  bot.sendMessage(chatId, helpText, {
    reply_to_message_id: originalMessageId
  });
});

bot.on('message', async msg => {
  const {message_id: originalMessageId, from: {username}, chat: {id: chatId}} = msg;
  switch (msg.text) {
    case '/start':
      bot.sendMessage(chatId, `Привет ${username}! Я #todo бот для канала`, {
        reply_to_message_id: originalMessageId
      });
      break;

    default:
      break;
  }
});

bot.on('channel_post', async (msg) => {
  const {text, message_id, chat: {id: chatId, type: chatType}} = msg;
  if (chatType === 'channel' && text) {
    const todoRegex = /^#todo /;
    const helpRegex = /\/help /;
    if (todoRegex.test(msg.text)) {
      console.log('ppp');
      try {
        opts = {
          reply_markup: {
            inline_keyboard: [
              [
                {text: '✔️ Выполнить', callback_data: 'done'},
                {text: '👀 Смотреть', callback_data: 'infocus'}
              ]
            ]
          }
        };
        await bot.editMessageReplyMarkup(opts.reply_markup, {chat_id: chatId, message_id: message_id});
      } catch (error) {
        // Обработка ошибок
      }
    } else if (text === '/help') {
      bot.sendMessage(chatId, helpText, {
        reply_to_message_id: message_id
      });
    }
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  let text = msg.text || '';
  const data = callbackQuery.data;
  let opts;
  switch (data) {
    case 'done':
      text = `✅ ${text.replace('~~', '').replace('#todo ', '').replace('👀', '')}`;
      opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{text: 'Выполнено', callback_data: 'undone'}]
          ]
        }
      };
      await bot.editMessageText(text, opts);
      break;
    case 'undone':
      text = text.startsWith('✅ ') ? '#todo ' + text.slice(2) : text;
      opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {text: '✔️ Выполнить', callback_data: 'done'},
              {text: '👀 Смотреть', callback_data: 'infocus'}
            ]
          ]
        }
      };
      await bot.editMessageText(text, opts);
      break;
    case 'unfocus':
      text = text.startsWith('👀 ') ? text.slice(2) : text;
      opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {text: '✔️ Выполнить', callback_data: 'done'},
              {text: '👀 Смотреть', callback_data: 'infocus'}
            ]
          ]
        }
      };
      await bot.editMessageText(text, opts);
      break;
    case 'infocus':
      text = `👀 ${text.replace('~~', '')}`;
      opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [

              {text: '✔️ Выполнить', callback_data: 'done'},
              {text: 'Убрать из фокуса', callback_data: 'unfocus'}
            ]
          ]
        }
      };
      await bot.editMessageText(text, opts);
      break;
    default:
      break;
  }
  bot.on("polling_error", err => console.log(err.data.error.message));
});

console.log('Бот запущен.');
