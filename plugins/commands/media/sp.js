import ytSearch from "yt-search";
import axios from "axios";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.1",
  description: "Search and play a song (mp3) from YouTube",
  usage: "<song name>",
  credits: "ArYAN",
  cooldown: 5,
  permissions: 0,
  category: "Music"
};

const langData = {
  "en_US": {
    "noSong": "🚫 Please provide a song name (e.g. `sing Shape of You`).",
    "notFound": "❌ No results found.",
    "downloading": "⏳ Downloading \"{title}\"...",
    "sendFail": "❌ Failed to send audio.",
    "downloadError": "❌ Download failed."
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

async function downloadFile(url, filePath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
  const buffer = await response.buffer();
  fs.writeFileSync(filePath, buffer);
}

async function playAudio({ message, song, getLang }) {
  const { title, videoId } = song;
  const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${videoId}&type=audio&apikey=itzaryan`;

  message.react("⏳");

  const filePath = path.join(global.cachePath, `_ytaudio_${Date.now()}.mp3`);
  try {
    const res = await axios.get(apiUrl);
    const downloadUrl = res.data?.downloadUrl;
    if (!downloadUrl) throw new Error("Missing download URL");

    await message.reply(getLang("downloading", { title }));
    await downloadFile(downloadUrl, filePath);

    if (!fs.existsSync(filePath)) throw new Error("Download failed");

    await message.reply({
      body: `🎵 ${title}`,
      attachment: fs.createReadStream(filePath)
    });

    message.react("✅");
  } catch (err) {
    console.error(err);
    message.react("❌");
    return message.reply(getLang("downloadError"));
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

async function chooseSong({ message, eventData, getLang }) {
  const { songs } = eventData;
  const index = parseInt(message.body) - 1;
  if (isNaN(index) || index < 0 || index >= songs.length)
    return message.reply(getLang("notFound"));

  await playAudio({ message, song: songs[index], getLang });
}

async function onCall({ message, args, getLang }) {
  const query = args.join(" ");
  if (!query) return message.reply(getLang("noSong"));

  try {
    const results = await ytSearch(query);
    const videos = results.videos?.slice(0, 6);

    if (!videos?.length) return message.reply(getLang("notFound"));

    const formattedList = videos
      .map((v, i) => `${i + 1}. ${v.title} (${v.timestamp})`)
      .join("\n\n");

    const replyMsg = await message.reply(
      `🎶 Choose a song (reply with number):\n\n${formattedList}`
    );

    return replyMsg.addReplyEvent({
      callback: chooseSong,
      songs: videos.map(v => ({
        title: v.title,
        videoId: v.videoId
      }))
    });
  } catch (err) {
    console.error("Sing command error:", err);
    return message.reply(getLang("sendFail"));
  }
}

export default {
  config,
  langData,
  onCall
};
