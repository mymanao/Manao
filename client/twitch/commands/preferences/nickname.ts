import {
  db,
  getNickname,
  initAccount,
  updateNickname,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "nickname", th: "ชื่อเล่น" },
  description: {
    en: "Change or show your nickname",
    th: "เปลี่ยนหรือแสดงชื่อเล่นของคุณ",
  },
  aliases: { en: ["nick", "name"], th: ["ชื่อ"] },
  args: [
    {
      name: { en: "nickname", th: "ชื่อเล่น" },
      description: { en: "Your new nickname", th: "ชื่อเล่นใหม่ของคุณ" },
      required: false,
    },
  ],
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const name = args.join(" ");

    initAccount(meta.userID);

    if (!args[0]) {
      const nickname = getNickname(meta.userID);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.currentNickname", meta.lang, nickname || meta.user)}`,
      );
      return;
    }

    if (["remove", "reset", "clear"].includes(name)) {
      updateNickname(meta.userID, null);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.currentNicknameRemoved", meta.lang)}`,
      );
      return;
    }

    if (name.length > 32) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorNicknameTooLong", meta.lang)}`,
      );
      return;
    }

    if (!name.match(/^[a-zA-Z0-9ก-๙ ]+$/)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorNicknameContainsSpecialChars", meta.lang)}`,
      );
      return;
    }

    updateNickname(meta.userID, name);
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentNicknameChanged", meta.lang, name)}`,
    );
    client.io.emit("feed", {
      type: "normal",
      icon: "✍️",
      message: `${meta.user} (${name})`,
      action: "Rename",
    });
  },
};
