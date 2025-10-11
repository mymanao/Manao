import { t } from "@helpers/i18n.ts";
import { version as twurpleVersion } from "@twurple/api/package.json";
import { version } from "@/package.json";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "version", th: "เวอร์ชัน" },
  description: {
    en: "Check bot's current version",
    th: "ตรวจสอบเวอร์ชันของบอท",
  },
  aliases: { en: ["v", "ver"], th: ["ว"] },
  execute: async (client: ClientServices, meta: CommandMeta) => {
    const MANAO_VERSION = version;
    const BUN_VERSION = Bun.version;
    const TWURPLE_VERSION = twurpleVersion;

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("info.version", meta.lang, MANAO_VERSION, BUN_VERSION, TWURPLE_VERSION)}`,
    );
  },
};
