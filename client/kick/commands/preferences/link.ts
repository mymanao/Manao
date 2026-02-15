import type { KickItContext } from "@manaobot/kickit/types";
import { pendingLinks } from "@discord/commands/preferences/link.ts";
import { t } from "@helpers/i18n.ts";
import { db } from "@helpers/database.ts";
import { getLang } from "@helpers/preferences.ts";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "link", th: "เชื่อมบัญชี" },
  description: {
    en: "Link your Kick account to Discord",
    th: "เชื่อมบัญชี Kick กับ Discord",
  },
  aliases: { en: ["connect"], th: ["เชื่อม"] },
  args: [
    {
      name: { en: "code", th: "รหัสเชื่อมต่อ" },
      description: {
        en: "Enter the 6-digit link code from Discord",
        th: "กรอกรหัส 6 หลักที่ได้จาก Discord",
      },
      required: true,
    },
  ],
  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const code = args[0]?.trim().toUpperCase();
    const entry = [...pendingLinks.entries()].find(
      ([, data]) => data.code === code && Date.now() - data.createdAt < 60000,
    );

    if (!entry) {
      await context.reply(
        `@${meta.user} ${t("configuration.errorCodeInvalidOrExpired", getLang())}`,
      );
      return;
    }

    const [discordID] = entry;

    db.prepare(`
        INSERT INTO linked_accounts (discord_id, kick_id)
        VALUES (?, ?) ON CONFLICT(discord_id) DO
        UPDATE SET
            kick_id = excluded.kick_id
    `).run(discordID, meta.userID);

    pendingLinks.delete(discordID);

    await context.reply(
      `@${meta.user} ${t("configuration.linkSuccess", getLang())}`,
    );
  },
};
