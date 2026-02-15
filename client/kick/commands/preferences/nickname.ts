import {
  getNickname,
  initAccountFromKick,
  updateNickname,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { io } from "@/server";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

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
      description: {
        en: "Your new nickname",
        th: "ชื่อเล่นใหม่ของคุณ",
      },
      required: false,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const name = args.join(" ").trim();
    const userID = meta.userID;

    initAccountFromKick(userID);

    if (!args[0]) {
      const nickname = getNickname(userID);

      await context.reply(
        `@${meta.user} ${t(
          "configuration.currentNickname",
          meta.lang,
          nickname || meta.user,
        )}`,
      );
      return;
    }

    if (["remove", "reset", "clear"].includes(name.toLowerCase())) {
      updateNickname(userID, null);

      await context.reply(
        `@${meta.user} ${t("configuration.currentNicknameRemoved", meta.lang)}`,
      );
      return;
    }

    if (name.length > 32) {
      await context.reply(
        `@${meta.user} ${t("configuration.errorNicknameTooLong", meta.lang)}`,
      );
      return;
    }

    if (!name.match(/^[a-zA-Z0-9ก-๙ ]+$/)) {
      await context.reply(
        `@${meta.user} ${t(
          "configuration.errorNicknameContainsSpecialChars",
          meta.lang,
        )}`,
      );
      return;
    }

    updateNickname(userID, name);

    await context.reply(
      `@${meta.user} ${t(
        "configuration.currentNicknameChanged",
        meta.lang,
        name,
      )}`,
    );

    io.emit("feed", {
      type: "normal",
      icon: "✍️",
      message: `${meta.user} (${name})`,
      action: "Rename",
    });
  },
};
