import { t } from "@helpers/i18n";
import { version as kickitVersion } from "@manaobot/kickit/package.json";
import { version as manaoVersion } from "@/package.json";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "version", th: "เวอร์ชัน" },
  description: {
    en: "Check bot's current version",
    th: "ตรวจสอบเวอร์ชันของบอท",
  },
  aliases: { en: ["v", "ver"], th: ["ว"] },

  execute: async (context: KickItContext, meta: CommandMeta): Promise<void> => {
    const MANAO_VERSION = manaoVersion;
    const KICKIT_VERSION = kickitVersion;
    await context.reply(
      `@${meta.user} ${t(
        "info.versionKick",
        meta.lang,
        MANAO_VERSION,
        KICKIT_VERSION,
        Bun.version,
      )}`,
    );
  },
};
