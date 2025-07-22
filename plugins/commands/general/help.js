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
    "help.commandNotExists": "Command '{command}' does not exist.",
    "help.commandDetails": `
----- Command Info -----

Name        : {name}
Aliases     : {aliases}
Version     : {version}
Description : {description}
Usage       : {usage}
Permissions : {permissions}
Category    : {category}
Cooldown    : {cooldown}s
Credits     : {credits}
`,
    "0": "Member",
    "1": "Group Admin",
    "2": "Bot Admin"
  },
  "vi_VN": {
    "help.commandNotExists": "Lệnh '{command}' không tồn tại.",
    "help.commandDetails": `
----- Thông tin lệnh -----

Tên         : {name}
Tên khác    : {aliases}
Phiên bản   : {version}
Mô tả       : {description}
Cách dùng   : {usage}
Quyền hạn   : {permissions}
Thể loại    : {category}
Thời gian chờ: {cooldown}s
Người viết  : {credits}
`,
    "0": "Thành viên",
    "1": "Quản trị nhóm",
    "2": "Quản trị bot"
  },
  "ar_SY": {
    "help.commandNotExists": "الأمر '{command}' غير موجود.",
    "help.commandDetails": `
----- معلومات الأمر -----

الاسم        : {name}
البدائل      : {aliases}
الوصف        : {description}
الاستخدام    : {usage}
الصلاحيات    : {permissions}
الفئة        : {category}
الانتظار     : {cooldown}s
الاعتمادات   : {credits}
`,
    "0": "عضو",
    "1": "إدارة المجموعة",
    "2": "ادارة البوت"
  }
};

function getCommandName(commandName) {
  if (global.plugins.commandsAliases.has(commandName)) return commandName;

  for (let [key, value] of global.plugins.commandsAliases) {
    if (value.includes(commandName)) return key;
  }

  return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
  const { commandsConfig } = global.plugins;
  const language = message?.thread?.data?.language || global.config.LANGUAGE || "en_US";
  const commandName = args[0]?.toLowerCase();

  // Flat paginated command list
  if (!commandName) {
    const visibleCommands = [];

    for (const [key, cmd] of commandsConfig.entries()) {
      if (cmd.isHidden) continue;
      if (cmd.isAbsolute && !global.config?.ABSOLUTES?.includes(message.senderID)) continue;
      if (!cmd.permissions?.some(p => userPermissions.includes(p))) continue;

      visibleCommands.push(key);
    }

    // Sort alphabetically
    visibleCommands.sort();

    const perPage = 25;
    const totalPages = Math.ceil(visibleCommands.length / perPage);
    const currentPage = Math.max(1, parseInt(args[1]) || 1);
    const pageCommands = visibleCommands.slice((currentPage - 1) * perPage, currentPage * perPage);

    const list = pageCommands.map(cmd => `● ${cmd}`).join("\n");

    return message.reply(
`${list}

Page: [${currentPage}/${totalPages}]
Total commands: ${visibleCommands.length}
Use ${prefix}help <name> for more info`
    );
  }

  // Command details
  const resolved = getCommandName(commandName);
  const command = commandsConfig.get(resolved);

  if (!command)
    return message.reply(getLang("help.commandNotExists", { command: commandName }));

  if (command.isHidden || (command.isAbsolute && !global.config?.ABSOLUTES?.includes(message.senderID)))
    return message.reply(getLang("help.commandNotExists", { command: commandName }));

  if (!command.permissions?.some(p => userPermissions.includes(p)))
    return message.reply(getLang("help.commandNotExists", { command: commandName }));

  return message.reply(
    getLang("help.commandDetails", {
      name: command.name,
      aliases: command.aliases?.join(", ") || "None",
      version: command.version || "1.0.0",
      description: command.description || "No description",
      usage: `${prefix}${command.name} ${command.usage || ""}`.trim(),
      permissions: command.permissions.map(p => getLang(String(p))).join(", "),
      category: command.category || "Others",
      cooldown: command.cooldown || 3,
      credits: "Nix"
    }).replace(/^ +/gm, "")
  );
}

export default {
  config,
  langData,
  onCall
};
