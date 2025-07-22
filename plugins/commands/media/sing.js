import ytSearch from "yt-search";
import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.3",
  description: "Play song from YouTube as MP3",
  usage: "<song name>",
  cooldown: 5,
  permissions: 0,
  credits: "ArYAN",
  category: "music"
};

const langData = {
  "en_US": {
    "noSong": "❌ Please type a song name (e.g. `sing Shape of You`).",
    "notFound": "⚠️ No song found.",
    "downloading": "⏳ Downloading: {title}",
    "error": "❌ Failed to download or send the song."
  }
};

async function downloadFile(url, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream"
  });

  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function onCall({ message, args, getLang }) {
  if (!args || args.length === 0) {
    return message.reply(getLang("noSong"));
  }

  const query = args.join(" ");

  try {
    const result = await ytSearch(query);
    const video = result.videos[0];

    if (!video) {
      return message.reply(getLang("notFound"));
    }

    const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${video.videoId}&type=audio&apikey=itzaryan`;
    const response = await axios.get(apiUrl);

    if (!response.data?.downloadUrl) {
      return message.reply(getLang("error"));
    }

    const filePath = path.join(global.cachePath, `song_${Date.now()}.mp3`);
    await message.reply(getLang("downloading", { title: video.title }));
    await downloadFile(response.data.downloadUrl, filePath);

    await message.reply({
      body: `🎵 ${video.title}`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("SING CMD ERROR:", err);
    return message.reply(getLang("error"));
  }
}

export default {
  config,
  langData,
  onCall
};
