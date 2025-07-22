import axios from "axios";

if (typeof ReadableStream === "undefined") {
  globalThis.ReadableStream = require("stream/web").ReadableStream;
}

const baseApiUrl = async () => "https://noobs-api.top/dipto";

export const config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "0.0.2",
  description: "simi-style bot for chatting.",
  usage: "{pn} [message] | teach/remove/edit/msg/list",
  cooldown: 3,
  permissions: 0,
  credits: "ArYAN",
  category: "chat"
};

const replyMap = new Map();

export async function onCall({ message, args, event, usersData }) {
  const link = `${await baseApiUrl()}/baby`;
  const uid = message.senderID;
  const input = args.join(" ").toLowerCase();

  if (!args[0]) {
    replyMap.set(message.threadID, { senderID: uid });
    return message.reply("Hmm bolo bby... 😚");
  }

  try {
    if (args[0] === "remove") {
      const query = input.replace("remove ", "");
      const res = await axios.get(`${link}?remove=${encodeURIComponent(query)}&senderID=${uid}`);
      return message.reply(res.data.message);
    }

    if (args[0] === "rm" && input.includes("-")) {
      const [key, index] = input.replace("rm ", "").split(/\s*-\s*/);
      const res = await axios.get(`${link}?remove=${encodeURIComponent(key)}&index=${index}`);
      return message.reply(res.data.message);
    }

    if (args[0] === "list") {
      const res = await axios.get(`${link}?list=all`);
      const teacherData = res.data.teacher?.teacherList || [];
      const totalTeach = res.data.length || 0;
      if (args[1] === "all") {
        const limit = parseInt(args[2]) || 50;
        const sliced = teacherData.slice(0, limit);
        const out = await Promise.all(
          sliced.map(async (entry, i) => {
            const uid = Object.keys(entry)[0];
            const count = entry[uid];
            const name = (await usersData.getName(uid).catch(() => uid));
            return `${i + 1}. ${name}: ${count}`;
          })
        );
        return message.reply(`📚 Total Teach = ${totalTeach}\n👑 Teachers:\n${out.join("\n")}`);
      } else {
        return message.reply(`📚 Total Teach = ${totalTeach}\n🗂 Total Response = ${res.data.responseLength || 0}`);
      }
    }

    if (args[0] === "msg") {
      const query = input.replace("msg ", "");
      const res = await axios.get(`${link}?list=${encodeURIComponent(query)}`);
      return message.reply(`"${query}" = ${res.data.data}`);
    }

    if (args[0] === "edit") {
      const parts = input.split(/\s*-\s*/);
      if (parts.length < 2) return message.reply("❌ Invalid format!");
      const res = await axios.get(`${link}?edit=${encodeURIComponent(parts[0])}&replace=${encodeURIComponent(parts[1])}&senderID=${uid}`);
      return message.reply(`Changed: ${res.data.message}`);
    }

    if (args[0] === "teach") {
      const [key, value] = input.replace("teach ", "").split(/\s*-\s*/);
      if (!value) return message.reply("❌ Invalid format!");

      const res = await axios.get(`${link}?teach=${encodeURIComponent(key)}&reply=${encodeURIComponent(value)}&senderID=${uid}&threadID=${message.threadID}`);
      const teacher = (await usersData.get(res.data.teacher)).name;
      return message.reply(`✅ Taught!\n👤 Teacher: ${teacher}\n📚 Total Teaches: ${res.data.teachs}`);
    }

    const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`);
    return message.reply(res.data.reply);
  } catch (err) {
    console.error("[BBY CMD]", err);
    return message.reply("❌ Error occurred while processing.");
  }
}

export async function onChat({ message, event }) {
  const input = event.body?.toLowerCase();
  const threadID = event.threadID;
  const senderID = event.senderID;
  const link = `${await baseApiUrl()}/baby`;

  if (!input) return;

  const pendingReply = replyMap.get(threadID);
  if (pendingReply && pendingReply.senderID === senderID) {
    replyMap.delete(threadID);
    try {
      const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${senderID}&font=1`);
      return message.reply(res.data.reply);
    } catch (err) {
      return message.reply("❌ Error processing reply.");
    }
  }

  const triggers = ["baby", "bby", "bot", "jan", "babu", "janu"];
  if (!triggers.some(t => input.startsWith(t))) return;

  const trimmed = input.replace(/^\S+\s*/, "");

  try {
    if (!trimmed) {
      replyMap.set(threadID, { senderID });
      const replies = ["😚", "Yes baby 🥺", "Bolo jaan 🥰", "Ki holo bolo to 🤭"];
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }
    const res = await axios.get(`${link}?text=${encodeURIComponent(trimmed)}&senderID=${senderID}&font=1`);
    return message.reply(res.data.reply);
  } catch (err) {
    return message.reply("❌ Error occurred.");
  }
}
