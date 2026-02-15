import { t } from "@helpers/i18n";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "help", th: "ช่วยเหลือ" },
  description: {
    en: "View all available commands",
    th: "ดูคำสั่งทั้งหมดที่ใช้ได้",
  },
  aliases: { en: ["h", "commands", "command"], th: ["คำสั่ง"] },
  args: [
    {
      name: { en: "command", th: "คำสั่ง" },
      description: { en: "Command name", th: "ชื่อคำสั่ง" },
      required: false,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const lang = meta.lang;

    if (args.length > 0) {
      let [cmdName] = args;
      if (!cmdName) return;

      cmdName = cmdName.toLowerCase();

      let foundCommand;

      for (const command of meta.commands.values()) {
        const matches =
          command.name.en.toLowerCase() === cmdName ||
          command.name.th?.toLowerCase() === cmdName ||
          (command.aliases?.en ?? [])
            .map((a) => a.toLowerCase())
            .includes(cmdName) ||
          (command.aliases?.th ?? [])
            .map((a) => a.toLowerCase())
            .includes(cmdName);

        if (matches) {
          foundCommand = command;
          break;
        }
      }

      if (!foundCommand) {
        await context.reply(
          `@${meta.user} ${t("info.errorCommandNotFound", lang, cmdName)}`,
        );
        return;
      }

      let argsDescription = "";
      let argsAlias = "";

      if (foundCommand.args) {
        argsDescription = foundCommand.args
          .map((arg) =>
            arg.required
              ? ` | (${arg.name[lang]}) - ${arg.description[lang]}`
              : ` | [${arg.name[lang]}] - ${arg.description[lang]}`,
          )
          .join("");
      }

      if (foundCommand.aliases?.[lang]?.length) {
        argsAlias = ` (${foundCommand.aliases[lang].join(", ")})`;
      }

      await context.reply(
        `📚 ${foundCommand.name[lang]}${argsAlias}: ${
          foundCommand.description[lang]
        }${argsDescription}`,
      );

      return;
    }

    await context.reply(`@${meta.user} ${t("info.help", lang)}`);
  },
};
