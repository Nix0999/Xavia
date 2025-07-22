import axios from "axios";

const config = {
  name: "drive",
  _name: {
    "ar_SY": "رفع"
  },
  aliases: ["gdrive", "upload"],
  version: "1.0.0",
  description: "Upload media or files to Google Drive",
  usage: "[link] or reply to media/file",
  credits: "ArYAN"
};

const langData = {
  "en_US": {
    "drive.noInput": "Please provide a valid file URL or reply to a message containing media.",
    "drive.uploading": "⏳ Uploading your file to Google Drive...",
    "drive.success": "✅ File uploaded to Google Drive!\n\n🔗 URL: {link}",
    "drive.failed": "❌ Upload failed: {error}",
    "drive.error": "An error occurred during upload. Please try again later."
  },
  "vi_VN": {
    "drive.noInput": "Vui lòng cung cấp URL hợp lệ hoặc trả lời tin nhắn chứa phương tiện.",
    "drive.uploading": "⏳ Đang tải lên Google Drive...",
    "drive.success": "✅ Tải tệp lên Google Drive thành công!\n\n🔗 Liên kết: {link}",
    "drive.failed": "❌ Tải lên thất bại: {error}",
    "drive.error": "Đã xảy ra lỗi trong quá trình tải lên. Vui lòng thử lại sau."
  },
  "ar_SY": {
    "drive.noInput": "يرجى تقديم رابط صالح أو الرد على رسالة تحتوي على وسائط.",
    "drive.uploading": "⏳ جارٍ رفع الملف إلى Google Drive...",
    "drive.success": "✅ تم رفع الملف إلى Google Drive!\n\n🔗 الرابط: {link}",
    "drive.failed": "❌ فشل الرفع: {error}",
    "drive.error": "حدث خطأ أثناء الرفع. حاول مرة أخرى لاحقاً."
  }
};

async function onCall({ message, args, getLang, telegram }) {
  let inputUrl = args[0];

  // If user replied to a message
  const reply = message.msg?.reply_to_message;
  if (!inputUrl && reply) {
    const file =
      reply.photo?.at(-1)?.file_id ||
      reply.video?.file_id ||
      reply.document?.file_id;

    if (file) {
      try {
        inputUrl = await telegram.getFileLink(file);
      } catch (e) {
        console.error("Error getting file link:", e);
      }
    }
  }

  if (!inputUrl) return message.reply(getLang("drive.noInput"));

  const uploading = await message.reply(getLang("drive.uploading"));

  try {
    const apiKey = "ArYAN";
    const api = `https://aryan-xyz-google-drive.vercel.app/drive?url=${encodeURIComponent(inputUrl)}&apikey=${apiKey}`;

    const res = await axios.get(api);
    const data = res.data;

    const driveLink = data.driveLink || data.driveLIink;

    if (driveLink) {
      return message.reply(
        getLang("drive.success", { link: driveLink })
      );
    } else {
      const error = data.error || data.message || JSON.stringify(data);
      return message.reply(getLang("drive.failed", { error }));
    }
  } catch (err) {
    console.error("Upload Error:", err);
    return message.reply(getLang("drive.error"));
  } finally {
    telegram.deleteMessage(message.threadID, uploading.message_id).catch(() => {});
  }
}

export default {
  config,
  langData,
  onCall
};
