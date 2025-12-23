import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";
import {
  isEventConnected,
  disconnectConnection,
  initializeConnection,
} from "@twitch/services/event.ts";

export default {
  name: {
    en: "event",
    th: "อีเวนต์",
  },
  description: {
    en: "Initiate a new event",
    th: "เริ่มต้นอีเวนต์ใหม่",
  },
  aliases: {
    en: ["e", "ev"],
    th: ["อ"],
  },
  args: [
    {
      name: {
        en: "action",
        th: "คำสั่ง",
      },
      description: {
        en: "Action to perform (connect, disconnect)",
        th: "คำสั่งที่ต้องการ (connect, disconnect)",
      },
      required: true,
    },
    {
      name: {
        en: "url",
        th: "url",
      },
      description: {
        en: "URL to connect to",
        th: "URL ที่ต้องการเชื่อมต่อ",
      },
      required: false,
    },
  ],
  modsOnly: true,
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const action = args[0]?.toLowerCase();

    if (!["connect", "disconnect"].includes(action || "")) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorInvalidAction", meta.lang)}`,
      );
      return;
    }

    switch (action) {
      case "connect":
        if (isEventConnected()) {
          await client.chat.say(
            meta.channel,
            `@${meta.user} ${t("moderation.errorEventAlreadyConnected", meta.lang)}`,
          );
          return;
        }

        const url = args[1];
        if (!url) {
          await client.chat.say(
            meta.channel,
            `@${meta.user} ${t("moderation.errorUrlRequired", meta.lang)}`,
          );
          return;
        }

        initializeConnection(url, async (msg: string) => {
          await client.chat.say(meta.channel, msg);
        });
        break;
      case "disconnect":
        if (!isEventConnected()) {
          await client.chat.say(
            meta.channel,
            `@${meta.user} ${t("moderation.errorEventNotConnected", meta.lang)}`,
          );
          return;
        }
        disconnectConnection();
        break;
    }
  },
};
