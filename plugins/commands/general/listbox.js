export const config = {
  name: "listbox",
  aliases: ["grouplist", "gl"],
  version: "1.0.0",
  description: "Show all groups the bot is in",
  usage: "{pn}",
  credits: "ArYAN",
  cooldown: 5,
  permissions: 1,
  category: "admin"
};

export async function onCall({ message, threadsData }) {
  try {
    const allThreads = await threadsData.getAll();
    const groupThreads = allThreads.filter(thread => thread.isGroup && thread.threadName);

    if (groupThreads.length === 0) {
      return message.reply("⚠️ No group data found.");
    }

    const list = groupThreads.map((thread, index) => {
      return `📦 ${index + 1}. ${thread.threadName} \n🆔 UID: ${thread.threadID}`;
    });

    const body = `📋 𝗕𝗢𝗧 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧:\n━━━━━━━━━━━━━━━\n\n${list.join(
      "\n\n"
    )}\n\n📌 𝗧𝗼𝘁𝗮𝗹: ${groupThreads.length} groups`;

    return message.reply(body);
  } catch (error) {
    console.error("LISTBOX CMD ERROR:", error);
    return message.reply("⚠️ Something went wrong while fetching group list.");
  }
}
