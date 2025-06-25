import axios from 'axios';

const config = {
  name: 'مشمش',
  version: '1.0',
  permissions: 0,
  credits: 'rapido',
  description: 'gemini ai with image support',
  commandCategory: 'ai',
  usages: '[text] (reply to image)',
  cooldown: 5
};

async function onCall({ message, args, getLang }) {
  const text = args.join(' ');
  
  // الردود المحلية على الأسئلة الشائعة
  if (!text || text === '') return message.reply("داير شنو يا بل ಠ_ಠ ؟");
  if (text.includes('من مطورك') || text.includes('من صنعك')) return message.reply("تم تطويري من قبل صلاح الدين المعروف بي Rako San ");
  if (text.includes('من أنت')) return message.reply(" أنا مشمش، مصمم من قبل عمك صلاح الدين لمساعدتك في الحصول على المعلومات 🐢.");

  try {
    let imageUrl;
    if (message.messageReply?.attachments?.[0]?.type === "photo") {
      imageUrl = message.messageReply.attachments[0].url;
    }
    const api = `https://rapido.zetsu.xyz/api/gemini?chat=${encodeURIComponent(text)}&uid=${message.senderID}${imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : ''}`;
    const res = await axios.get(api);
    message.reply(res.data.response);
  } catch (e) {
    message.reply(e);
  }
}

export default { config, onCall };
