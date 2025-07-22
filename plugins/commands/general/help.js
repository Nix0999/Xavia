const config = {
  name: "help",
  _name: {
    "ar_SY": "الاوامر"
  },
  aliases: ["cmds", "commands"],
  version: "1.0.4",
  description: "Show all commands or command details",
  usage: "[command] (optional)",
  credits: "XaviaTeam (Styled by ChatGPT)"
};

const langData = {
  "en_US": {
    "help.list": `📜✨ *Here are all my commands, cutie!* ✨📜\n\n{list}\n\n🔢 Total: *{total}* commands\n💡 Tip: Use *{syntax} [command]* to get more info about a command.`,
    "help.commandNotExists": "❌ Oops! The command *{command}* doesn't exist.",
    "help.commandDetails": `🛠️✨ *Command Details:* ✨🛠️

🔹 *Name:* {name}
🔸 *Aliases:* {aliases}
📦 *Version:* {version}
📝 *Description:* {description}
📚 *Usage:* {usage}
🔐 *Permissions:* {permissions}
🗂️ *Category:* {category}
⏱️ *Cooldown:* {cooldown}
👑 *Credits:* {credits}`,
    "0": "👤 Member",
    "1": "🛡️ Group Admin",
    "2": "🤖 Bot Admin"
  },
  "vi_VN": {
    "help.list": `📜✨ *Đây là tất cả các lệnh của tớ nè!* ✨📜\n\n{list}\n\n🔢 Tổng cộng: *{total}* lệnh\n💡 Dùng *{syntax} [lệnh]* để biết thêm chi tiết nhé.`,
    "help.commandNotExists": "❌ Lệnh *{command}* không tồn tại.",
    "help.commandDetails": `🛠️✨ *Chi tiết lệnh:* ✨🛠️

🔹 *Tên:* {name}
🔸 *Tên khác:* {aliases}
📦 *Phiên bản:* {version}
📝 *Mô tả:* {description}
📚 *Cách dùng:* {usage}
🔐 *Quyền hạn:* {permissions}
🗂️ *Thể loại:* {category}
⏱️ *Delay:* {cooldown}
👑 *Tác giả:* {credits}`,
    "0": "👤 Thành viên",
    "1": "🛡️ Quản trị nhóm",
    "2": "🤖 Quản trị bot"
  }
};

const fs = require("fs");
const path = require("path");

async function onCall({ message, args, getLang, commands, prefix }) {
  const commandName = args[0]?.toLowerCase();

  if (!commandName) {
    const categories = {};
    for (const command of commands.values()) {
      const category = command.category || "Others";
      if (!categories[category]) categories[category] = [];
      categories[category].push(`🔸 ${command.name}`);
    }

    const list = Object.entries(categories).map(
      ([category, cmds]) => `📁 *${category}*\n${cmds.join("\n")}`
    ).join("\n\n");

    return message.reply(
      getLang("help.list", {
        list,
        total: commands.size,
        syntax: prefix + config.name
      })
    );
  }

  const command = commands.get(commandName) || [...commands.values()].find(cmd => cmd.aliases?.includes(commandName));
  if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

  const aliases = command.aliases?.join(", ") || "None";
  const permissions = getLang[String(command.permission || 0)] || "Unknown";
  const category = command.category || "Others";

  return message.reply(
    getLang("help.commandDetails", {
      name: command.name,
      aliases,
      version: command.version || "1.0",
      description: command.description || "No description provided",
      usage: prefix + command.name + " " + (command.usage || ""),
      permissions,
      category,
      cooldown: (command.cooldown || 3) + "s",
      credits: "Xavia || Nix"
    })
  );
}

module.exports = {
  config,
  langData,
  onCall
};
