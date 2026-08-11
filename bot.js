const { createClient } = require('@supabase/supabase-js');

const MY_TELEGRAM_ID = 1841122025; 
const BOT_TOKEN = '8997988532:AAG6DFjrVDzkwZ7EX4gY_QGtEuUcAo9VNTc';
const SUPABASE_URL = 'https://zhvhkbchztcqorocbngv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pv6F4MnwE7AUowAOVddI3A_8TNfwm35';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    const update = req.body;
    if (!update || !update.message || !update.message.text) return res.status(200).send('OK');

    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text.trim();

    if (userId !== MY_TELEGRAM_ID) {
      await sendMessage(chatId, '🔒 <b>Доступ обмежено.</b> Створювати акаунти може лише Головний Адміністратор.');
      return res.status(200).send('OK');
    }

    if (text === '/start') {
      await sendMessage(chatId, 
        '👑 <b>Панель адміністратора UGTA</b>\n\n' +
        'Щоб створити акаунт модератора, надсилай:\n' +
        '<code>/reg Нік Сервер Роль</code>\n\n' +
        '<b>Приклад:</b>\n<code>/reg Петро_Іванов 05 Moderator</code>'
      );
      return res.status(200).send('OK');
    }

    if (text.startsWith('/reg')) {
      const parts = text.split(' ').filter(Boolean);
      if (parts.length < 4) {
        await sendMessage(chatId, '⚠️ Формат: <code>/reg Нік Сервер Роль</code>');
        return res.status(200).send('OK');
      }

      const nick = parts[1];
      const server = parts[2].padStart(2, '0');
      const role = parts[3];

      const accountNumber = String(Math.floor(10000 + Math.random() * 90000));
      const password = generatePassword(8);

      const { error } = await supabase.from('profiles').insert([
        { account_number: accountNumber, password, nick, server, role }
      ]);

      if (error) {
        await sendMessage(chatId, `❌ <b>Помилка БД:</b> ${error.message}`);
      } else {
        await sendMessage(chatId, 
          '🟢 <b>Акаунт успішно створено!</b>\n\n' +
          `👤 <b>Нік:</b> ${nick}\n` +
          `🛡️ <b>Сервер:</b> ${server}\n` +
          `🔰 <b>Роль:</b> ${role}\n\n` +
          `🔑 <b>Логін (Номер):</b> <code>${accountNumber}</code>\n` +
          `🔐 <b>Пароль:</b> <code>${password}</code>`
        );
      }
    }
  } catch (err) {
    console.error(err);
  }

  return res.status(200).send('OK');
};
