import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "stomp", th: "กระทืบ" },
  description: { en: "Stomp on someone!", th: "กระทืบใครสักคน!" },
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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const stompTimes = Math.floor(Math.random() * 1000);
    client.io.emit("feed", {
      type: "neutral",
      icon: "👣",
      message: `${meta.user} ➡ ${args[0] || meta.user}`,
      action: `${stompTimes} times`,
    });
    await client.chat.say(
      meta.channel,
      `${meta.user} 👣 ${args[0] || meta.user} ${stompTimes} ${t("misc.times", meta.lang)}`,
    );
  },
};
