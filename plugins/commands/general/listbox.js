export const config = {
  name: "listbox",
  aliases: ["boxlist", "threadlist", "groups"],
  version: "1.0.1",
  credits: "ArYAN",
  description: "Show all groups the bot is in with names and UIDs.",
  usage: "{pn}",
  cooldown: 5,
  permissions: 2, // admin only
  category: "admin"
};

export async function onCall({ message, api }) {
  try {
    const threads = await api.getThreadList(100, null, ["INBOX"]); // Fetch threads

    const groups = threads.filter(
      t => t.isGroup && t.name !== null && t.threadID
    );

    if (groups.length === 0) {
      return message.reply("😕 No group found.");
    }

    // Sort by name
    groups.sort((a, b) => a.name.localeCompare(b.name));

    // Format output
    const output = groups.map((g, i) => 
      `📦 ${i + 1}. 🧁 𝙉𝙖𝙢𝙚: 『 ${g.name} 』\n🆔 𝙄𝘿: ${g.threadID}\n━━━━━━━━━━━━━`
    ).join("\n");

    const finalMsg = `🎁 𝗕𝗼𝘁 𝗜𝘀 𝗜𝗻 ${groups.length} 𝗚𝗿𝗼𝘂𝗽𝘀 🎁\n━━━━━━━━━━━━━\n${output}`;

    return message.reply(finalMsg);
  } catch (err) {
    console.error("❌ listbox error:", err);
    return message.reply("⚠️ Something went wrong while fetching group list.");
  }
}
