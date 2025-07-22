export const config = {
  name: "listbox",
  aliases: ["threads", "groups", "boxlist"],
  version: "1.0.0",
  credits: "ArYAN",
  description: "Show all groups the bot is in with names and IDs.",
  usage: "{pn}",
  cooldown: 5,
  permissions: 2, // Only bot admin
  category: "admin",
};

export async function onCall({ message, threadsData }) {
  try {
    const allThreads = await threadsData.getAll(); // Get all threads

    if (!allThreads || allThreads.length === 0) {
      return message.reply("😔 No group found.");
    }

    // Filter group threads (type = 1)
    const groupThreads = allThreads.filter(thread => thread.threadID && thread.threadName && thread.isGroup);

    if (groupThreads.length === 0) {
      return message.reply("😔 No active group threads found.");
    }

    // Sort by name
    groupThreads.sort((a, b) => a.threadName.localeCompare(b.threadName));

    // Build fancy output
    const listText = groupThreads.map((t, i) => {
      const number = i + 1;
      return `📦 ${number}. 𝙉𝙖𝙢𝙚: 『 ${t.threadName} 』\n🆔 ID: ${t.threadID}\n━━━━━━━━━━━━━`;
    }).join("\n");

    const msg = `🎁 𝗕𝗼𝘅𝗲𝘀 𝗧𝗵𝗲 𝗕𝗼𝘁 𝗜𝘀 𝗜𝗻 🎁\n━━━━━━━━━━━━━\n${listText}\n\n📌 Total: ${groupThreads.length} Groups`;

    return message.reply(msg);
  } catch (err) {
    console.error("❌ listbox error:", err);
    return message.reply("⚠️ Something went wrong while fetching group list.");
  }
}
