const config = {
  name: "help",
  _name: {
    "ar_SY": "الاوامر"
  },
  aliases: ["cmds", "commands"],
  version: "1.0.4",
  description: "Show all commands or command details",
  usage: "[command] (optional)",
  credits: "XaviaTeam"
};

const langData = {
  "en_US": {
    "help.list": `📜✨ 𝗛𝗲𝗿𝗲 𝗮𝗹𝗹 𝗰𝗺𝗱𝘀✨📜

{list}

🔢 𝗧𝗼𝘁𝗮𝗹: {total} 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀
💡 𝗨𝘀𝗲 \`{syntax} [command]\` 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀.`,
    "help.commandNotExists": "❌ The command `{command}` doesn't exist!",
    "help.commandDetails": `📖✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗗𝗲𝘁𝗮𝗶𝗹𝘀 ✨📖

🔹 𝗡𝗮𝗺𝗲: {name}
🔸 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: {aliases}
📦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: {version}
📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: {description}
📚 𝗨𝘀𝗮𝗴𝗲: {usage}
🔐 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻𝘀: {permissions}
🗂️ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: {category}
⏱️ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: {cooldown}
👑 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: {credits}`
  },
  "0": "👤 Member",
  "1": "🛡️ Group Admin",
  "2": "🤖 Bot Admin"
};

async function onCall({ message, args, getLang, commands = new Map(), prefix }) {
  const commandName = args[0]?.toLowerCase();

  // No specific command provided, show list
  if (!commandName) {
    const categories = {};

    for (const command of commands.values()) {
      const category = command.category || "Others";
      if (!categories[category]) categories[category] = [];
      categories[category].push(`🔹 ${prefix}${command.name}`);
    }

    const list = Object.entries(categories)
      .map(([category, cmds]) => `📁 ${category.toUpperCase()}\n${cmds.join("\n")}`)
      .join("\n\n");

    return message.reply(
      getLang("help.list", {
        list,
        total: commands.size,
        syntax: prefix + config.name
      })
    );
  }

  // Try to find the command by name or alias
  const command =
    commands.get(commandName) ||
    [...commands.values()].find(cmd => cmd.aliases?.map(a => a.toLowerCase()).includes(commandName));

  if (!command) {
    return message.reply(getLang("help.commandNotExists", { command: commandName }));
  }

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
      credits: "Nix"
    })
  );
}

export { config, langData, onCall };
