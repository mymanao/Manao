import { t } from "@helpers/i18n";
import { io } from "@/server";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "stomp", th: "กระทืบ" },
  description: {
    en: "Stomp on someone!",
    th: "กระทืบใครสักคน!",
  },
  aliases: { en: [], th: ["ถีบ"] },

  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to stomp",
        th: "ผู้ใช้ที่คุณต้องการกระทืบ",
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
    const stompTimes = Math.floor(Math.random() * 1000);
    const target = args[0] || meta.user;

    io.emit("feed", {
      type: "neutral",
      icon: "👣",
      message: `${meta.user} ➡ ${target}`,
      action: `${stompTimes} times`,
    });

    await context.reply(
      `${meta.user} 👣 ${target} ${stompTimes} ${t("misc.times", meta.lang)}`
    );
  },
};
