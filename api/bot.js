const MY_TELEGRAM_ID = 1841122025; 
const BOT_TOKEN = '8997988532:AAG6DFjrVDzkwZ7EX4gY_QGtEuUcAo9VNTc';
const SUPABASE_URL = 'https://zhvhkbchztcqorocbngv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pv6F4MnwE7AUowAOVddI3A_8TNfwm35';

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

async function sendMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Telegram API error:', e);
  }
}

module.exports = async (req, res) => {
  // Завжди повертаємо 200 OK для Telegram, щоб він не видавав помилок сервера
  try {
    if (req.method !== 'POST') {
      return res.status(200).json({ status: 'OK' });
    }

    const update = req.body;
    if (!update || !update.message || !update.message.text) {
      return res.status(200).json({ status: 'OK' });
    }

    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text.trim();

    if (userId !== MY_TELEGRAM_ID) {
      await sendMessage(chatId, '🔒 <b>Доступ обмежено.</b> Створювати акаунти може лише Головний Адміністратор.');
      return res.status(200).json({ status: 'OK' });
    }

    if (text === '/start') {
      await sendMessage(chatId, 
        '👑 <b>Панель адміністратора UGTA</b>\n\n' +
        'Щоб створити акаунт модератора, надсилай:\n' +
        '<code>/reg Нік Сервер Роль</code>\n\n' +
        '<b>Приклад:</b>\n<code>/reg Петро_Іванов 05 Moderator</code>'
      );
      return res.status(200).json({ status: 'OK' });
    }

    if (text.startsWith('/reg')) {
      const parts = text.split(' ').filter(Boolean);
      if (parts.length < 4) {
        await sendMessage(chatId, '⚠️ Формат: <code>/reg Нік Сервер Роль</code>');
        return res.status(200).json({ status: 'OK' });
      }

      const nick = parts[1];
      const server = parts[2].padStart(2, '0');
      const role = parts[3];

      const accountNumber = String(Math.floor(10000 + Math.random() * 90000));
      const password = generatePassword(8);

      const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          account_number: accountNumber,
          password: password,
          nick: nick,
          server: server,
          role: role
        })
      });

      if (!dbResponse.ok) {
        const errText = await dbResponse.text();
        await sendMessage(chatId, `❌ <b>Помилка БД:</b> ${errText}`);
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

    return res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error('Critical error:', err);
    return res.status(200).json({ status: 'OK' });
  }
};
