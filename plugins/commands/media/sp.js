import ytSearch from "yt-search";
import axios from "axios";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.0",
  description: "Search and play a song in MP3 format",
  usage: "<song name>",
  credits: "ArYAN",
  cooldown: 5,
  permissions: 0,
  category: "Music"
};

const langData = {
  "en_US": {
    "noSong": "🚫 Please provide a song name (e.g. `sing Shape of You`).",
    "notFound": "❌ No results found for that song.",
    "downloading": "⏳ Downloading \"{title}\"...",
    "sendFail": "❌ Failed to send audio.",
    "downloadError": "❌ Failed to download the song."
  },
  "vi_VN": {
    "noSong": "🚫 Vui lòng nhập tên bài hát (ví dụ: `sing Em của ngày hôm qua`).",
    "notFound": "❌ Không tìm thấy bài hát.",
    "downloading": "⏳ Đang tải \"{title}\"...",
    "sendFail": "❌ Gửi âm thanh thất bại.",
    "downloadError": "❌ Tải bài hát thất bại."
  },
  "ar_SY": {
    "noSong": "🚫 يرجى إدخال اسم الأغنية (مثال: `sing Shape of You`).",
    "notFound": "❌ لم يتم العثور على نتائج.",
    "downloading": "⏳ جارٍ تحميل \"{title}\"...",
    "sendFail": "❌ فشل إرسال الصوت.",
    "downloadError": "❌ فشل تحميل الأغنية."
  }
};

async function onCall({ message, args, getLang }) {
  const query = args.join(" ");
  if (!query) return message.reply(getLang("noSong"));

  try {
    const search = await ytSearch(query);
    if (!search?.videos?.length) return message.reply(getLang("notFound"));

    const video = search.videos[0];
    const downloadUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${video.videoId}&type=audio&apikey=itzaryan`;

    await message.reply(getLang("downloading", { title: video.title }));

    const { data } = await axios.get(downloadUrl);
    if (!data?.downloadUrl) return message.reply(getLang("downloadError"));

    const res = await fetch(data.downloadUrl);
    if (!res.ok) return message.reply(getLang("downloadError"));

    const buffer = await res.buffer();
    const filename = `${video.title}.mp3`.replace(/[\\/:"*?<>|]+/g, "");
    const filePath = path.join("/tmp", filename);
    fs.writeFileSync(filePath, buffer);

    await message.reply({
      body: `🎵 ${video.title}`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Sing Command Error:", err);
    return message.reply(getLang("sendFail"));
  }
}

export default {
  config,
  langData,
  onCall
};
