import axios from "axios";

const baseApiUrl = async () => "https://noobs-api.top/dipto";

export const config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "7.0.0",
  description: "Better than all simi-style bots.",
  usage: "{pn} [message] | teach/remove/edit/msg/list",
  cooldown: 3,
  permissions: 0,
  credits: "ArYAN",
  category: "chat",
};

export async function onCall({ message, args, event, usersData }) {
  const link = `${await baseApiUrl()}/baby`;
  const uid = message.senderID;
  const input = args.join(" ").toLowerCase();

  if (!args[0]) {
    const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
    return message.reply(ran[Math.floor(Math.random() * ran.length)]);
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
      if (args[1] === "all") {
        const res = await axios.get(`${link}?list=all`);
        const limit = parseInt(args[2]) || 100;
        const data = res.data.teacher.teacherList.slice(0, limit);
        const teachers = await Promise.all(
          data.map(async (t) => {
            const uid = Object.keys(t)[0];
            const count = t[uid];
            const name = (await usersData.getName(uid).catch(() => null)) || uid;
            return { name, count };
          })
        );
        teachers.sort((a, b) => b.count - a.count);
        const out = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.count}`).join("\n");
        return message.reply(`Total Teach = ${res.data.length}\n👑 Teachers:\n${out}`);
      } else {
        const res = await axios.get(`${link}?list=all`);
        return message.reply(`Total Teach = ${res.data.length || "N/A"}\nTotal Response = ${res.data.responseLength || "N/A"}`);
      }
    }

    if (args[0] === "msg") {
      const query = input.replace("msg ", "");
      const res = await axios.get(`${link}?list=${encodeURIComponent(query)}`);
      return message.reply(`Message "${query}" = ${res.data.data}`);
    }

    if (args[0] === "edit") {
      const parts = input.split(/\s*-\s*/);
      if (parts.length < 2) return message.reply("❌ Invalid format!");
      const res = await axios.get(`${link}?edit=${encodeURIComponent(args[1])}&replace=${encodeURIComponent(parts[1])}&senderID=${uid}`);
      return message.reply(`Changed: ${res.data.message}`);
    }

    if (args[0] === "teach") {
      const type = args[1];
      const [keyPart, valuePart] = input.replace("teach ", "").split(/\s*-\s*/);
      if (!valuePart) return message.reply("❌ Invalid format!");

      if (type === "react") {
        const res = await axios.get(`${link}?teach=${encodeURIComponent(keyPart.replace("react ", ""))}&react=${encodeURIComponent(valuePart)}`);
        return message.reply(`✅ Reactions added: ${res.data.message}`);
      } else if (type === "amar") {
        const res = await axios.get(`${link}?teach=${encodeURIComponent(keyPart)}&senderID=${uid}&reply=${encodeURIComponent(valuePart)}&key=intro`);
        return message.reply(`✅ Replies added: ${res.data.message}`);
      } else {
        const res = await axios.get(`${link}?teach=${encodeURIComponent(keyPart)}&reply=${encodeURIComponent(valuePart)}&senderID=${uid}&threadID=${message.threadID}`);
        const teacher = (await usersData.get(res.data.teacher)).name;
        return message.reply(`✅ Replies added: ${res.data.message}\n👤 Teacher: ${teacher}\n📚 Total: ${res.data.teachs}`);
      }
    }

    // Name-related auto response
    if (["amar name ki", "amr nam ki", "amar nam ki", "amr name ki", "whats my name"].some(p => input.includes(p))) {
      const res = await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`);
      return message.reply(res.data.reply);
    }

    // Default reply
    const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`);
    return message.reply(res.data.reply);
  } catch (err) {
    console.error("[BBY CMD]", err);
    return message.reply("❌ An error occurred. Try again later.");
  }
}

export async function onChat({ message, event }) {
  const triggers = ["baby", "bby", "bot", "jan", "babu", "janu"];
  const input = event.body?.toLowerCase();
  if (!input) return;
  const match = triggers.find(t => input.startsWith(t));
  if (!match) return;

  const trimmed = input.replace(/^\S+\s*/, "");
  const link = `${await baseApiUrl()}/baby`;

  try {
    if (!trimmed) {
      const replies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }
    const res = await axios.get(`${link}?text=${encodeURIComponent(trimmed)}&senderID=${event.senderID}&font=1`);
    return message.reply(res.data.reply);
  } catch (err) {
    console.error("[BBY CHAT]", err);
    return message.reply("Error: " + err.message);
  }
}
