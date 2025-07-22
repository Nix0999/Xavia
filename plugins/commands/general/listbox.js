export const config = {
  name: "listbox",
  version: "1.0.0",
  description: "Show all group names and thread IDs the bot is in",
  usage: "{pn}",
  cooldown: 5,
  permissions: 2,
  credits: "ArYAN",
  category: "general"
};

export async function onCall({ message }) {
  try {
    // Xavia bot's DB system
    const allThreads = await global.db.allThreadData();

    if (!allThreads || allThreads.length === 0) {
      return message.reply("⚠️ No group data found.");
    }

    const groups = allThreads.filter(t => t.threadID && t.threadName);
    if (groups.length === 0) {
      return message.reply("⚠️ No valid group names found.");
    }

    let output = "📋 𝗕𝗢𝗧 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧:\n━━━━━━━━━━━━━━━\n\n";
    groups.forEach((t, i) => {
      output += `📦 ${i + 1}. ${t.threadName}\n🆔 UID: ${t.threadID}\n\n`;
    });

    output += `📌 𝗧𝗼𝘁𝗮𝗹: ${groups.length} groups`;

    return message.reply(output);
  } catch (err) {
    console.error("LISTBOX CMD ERROR:", err);
    return message.reply("❌ Something went wrong while fetching group list.");
  }
}
