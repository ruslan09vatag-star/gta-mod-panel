const SUPABASE_URL = 'https://zhvhkbchztcqorocbngv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pv6F4MnwE7AUowAOVddI3A_8TNfwm35';
const BOT_TOKEN = '8997988532:AAG6DFjrVDzkwZ7EX4gY_QGtEuUcAo9VNTc';

exports.handler = async (event) => {
  try {
    if (!event.body) return { statusCode: 200, body: 'OK' };

    const update = JSON.parse(event.body);

    if (update.callback_query) {
      const callback = update.callback_query;
      const callbackId = callback.id;
      const data = callback.data; // approve_USERID або reject_USERID
      const messageId = callback.message.message_id;
      const chatId = callback.message.chat.id;
      const oldText = callback.message.text;

      const [action, userId] = data.split('_');

      let newStatus = '';
      let statusText = '';

      if (action === 'approve') {
        newStatus = 'approved';
        statusText = '✅ <b>СХВАЛЕНО</b>';
      } else if (action === 'reject') {
        newStatus = 'rejected';
        statusText = '❌ <b>ВІДХИЛЕНО</b>';
      }

      if (newStatus && userId) {
        // 1. Оновлюємо статус у Supabase через REST API (без бібліотек)
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ status: newStatus })
        });

        // 2. Знімаємо завантаження з кнопки в Telegram
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: action === 'approve' ? 'Заявку схвалено!' : 'Заявку відхилено!'
          })
        });

        // 3. Оновлюємо текст у чаті та прибираємо кнопки
        const updatedText = `${oldText}\n\n<b>Статус:</b> ${statusText}`;

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: updatedText,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          })
        });
      }
    }

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return { statusCode: 500, body: error.toString() };
  }
};
