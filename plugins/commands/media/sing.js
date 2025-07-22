import ytSearch from "yt-search";
import axios from "axios";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.2",
  description: "Search and send MP3 song from YouTube",
  usage: "<song name>",
  credits: "ArYAN",
  cooldown: 5,
  permissions: 0,
  category: "Music"
};

const langData = {
  "en_US": {
    "noSong": "🚫 Please type a song name (e.g. `sing Shape of You`).",
    "notFound": "❌ No results found.",
    "downloading": "⏳ Downloading \"{title}\"...",
    "sendFail": "❌ Could not send the audio.",
    "downloadError": "❌ Couldn't download song."
  }
};

async function downloadFile(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download request failed");
  const buffer = await res.buffer();
  fs.writeFileSync(filePath, buffer);
}

async function playAudio({ message, song, getLang }) {
  const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${song.videoId}&type=audio&apikey=itzaryan`;
  const filePath = path.join(global.cachePath, `_ytmp3_${Date.now()}.mp3`);

  try {
    await message.react("⏳");
    await message.reply(getLang("downloading", { title: song.title }));

    const res = await axios.get(apiUrl);
    const dlUrl = res.data?.downloadUrl;
    if (!dlUrl) throw new Error("No download URL");

    await downloadFile(dlUrl, filePath);

    await message.reply({
      body: `🎧 ${song.title}`,
      attachment: fs.createReadStream(filePath)
    });

    await message.react("✅");
  } catch (err) {
    console.error("Play error:", err);
    await message.react("❌");
    await message.reply(getLang("downloadError"));
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

async function chooseSong({ message, eventData, getLang }) {
  const { songs } = eventData;
  const index = parseInt(message.body) - 1;
  if (isNaN(index) || index < 0 || index >= songs.length)
    return message.reply(getLang("notFound"));

  return playAudio({ message, song: songs[index], getLang });
}

async function onCall({ message, args, getLang }) {
  const query = args.join(" ").trim();
  if (!query) {
    return message.reply(getLang("noSong"));
  }

  try {
    const results = await ytSearch(query);
    const videos = results.videos?.slice(0, 6);

    if (!videos || videos.length === 0) {
      return message.reply(getLang("notFound"));
    }

    const list = videos
      .map((v, i) => `${i + 1}. ${v.title} (${v.timestamp})`)
      .join("\n\n");

    const replyMsg = await message.reply(
      `🎶 Choose a song to play (reply with number):\n\n${list}`
    );

    return replyMsg.addReplyEvent({
      callback: chooseSong,
      songs: videos.map(v => ({ title: v.title, videoId: v.videoId }))
    });
  } catch (err) {
    console.error("Search error:", err);
    return message.reply(getLang("sendFail"));
  }
}

export default {
  config,
  langData,
  onCall
};
