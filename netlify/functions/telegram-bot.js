const { createClient } = require('@supabase/supabase-js');

// 1. ТВІЙ ОСОБИСТИЙ TELEGRAM ID ТА ДАНІ ПРОЄКТУ
const MY_TELEGRAM_ID = 1841122025; 
const BOT_TOKEN = '8997988532:AAG6DFjrVDzkwZ7EX4gY_QGtEuUcAo9VNTc';
const SUPABASE_URL = 'https://zhvhkbchztcqorocbngv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pv6F4MnwE7AUowAOVddI3A_8TNfwm35';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Генератор паролів
function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

// Функція відправки повідомлень у Telegram
async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };

  try {
    const update = JSON.parse(event.body);
    if (!update.message || !update.message.text) return { statusCode: 200, body: 'OK' };

    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text.trim();

    // ⛔ ЖОРСТКИЙ ЗАХИСТ: Перевірка твоєї особи за ID
    if (userId !== MY_TELEGRAM_ID) {
      await sendMessage(chatId, '🔒 <b>Доступ обмежено.</b> Створювати акаунти модераторів може лише Головний Адміністратор.');
      return { statusCode: 200, body: 'OK' };
    }

    // Команда /start
    if (text === '/start') {
      await sendMessage(chatId, 
        '👑 <b>Панель адміністратора UGTA</b>\n\n' +
        'Щоб створити акаунт модератора, надішли команду у форматі:\n' +
        '<code>/reg Нік Сервер Роль</code>\n\n' +
        '<b>Приклад:</b>\n<code>/reg Петро_Іванов 05 Moderator</code>'
      );
      return { statusCode: 200, body: 'OK' };
    }

    // Команда /reg для створення акаунта
    if (text.startsWith('/reg')) {
      const parts = text.split(' ').filter(Boolean);

      if (parts.length < 4) {
        await sendMessage(chatId, '⚠️ <b>Невірний формат!</b>\nВикористовуй: <code>/reg Нік Сервер Роль</code>\n\nПриклад: <code>/reg Петро_Іванов 05 Moderator</code>');
        return { statusCode: 200, body: 'OK' };
      }

      const nick = parts[1];
      const server = parts[2].padStart(2, '0');
      const role = parts[3];

      // Генеруємо 5-значний номер акаунта та пароль
      const accountNumber = String(Math.floor(10000 + Math.random() * 90000));
      const password = generatePassword(8);

      // Додаємо запис у Supabase
      const { error } = await supabase.from('profiles').insert([
        {
          account_number: accountNumber,
          password: password,
          nick: nick,
          server: server,
          role: role
        }
      ]);

      if (error) {
        await sendMessage(chatId, `❌ <b>Помилка бази даних:</b> ${error.message}`);
      } else {
        await sendMessage(chatId, 
          '🟢 <b>Акаунт успішно створено!</b>\n\n' +
          `👤 <b>Нік:</b> ${nick}\n` +
          `🛡️ <b>Сервер:</b> ${server}\n` +
          `🔰 <b>Роль:</b> ${role}\n\n` +
          `🔑 <b>Логін (Номер акаунта):</b> <code>${accountNumber}</code>\n` +
          `🔐 <b>Пароль:</b> <code>${password}</code>`
        );
      }
    }

  } catch (err) {
    console.error(err);
  }

  return { statusCode: 200, body: 'OK' };
};
