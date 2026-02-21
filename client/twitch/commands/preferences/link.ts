import { pendingLinks } from "@discord/commands/info/link.ts";
import { db } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "link", th: "เชื่อมบัญชี" },
  description: {
    en: "Link your Twitch account to Discord",
    th: "เชื่อมบัญชี Twitch กับ Discord",
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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const code = args[0]?.trim().toUpperCase();
    const entry = [...pendingLinks.entries()].find(
      ([, data]) => data.code === code && Date.now() - data.createdAt < 60000,
    );

    if (!entry) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorCodeInvalidOrExpired", meta.lang)}`,
      );
      return;
    }

    const [discordID] = entry;

    db.prepare(`
        INSERT INTO linked_accounts (discord_id, twitch_id)
        VALUES (?, ?)
        ON CONFLICT(discord_id) DO UPDATE SET twitch_id = excluded.twitch_id
    `).run(discordID, meta.userID);

    pendingLinks.delete(discordID);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.linkSuccess", meta.lang)}`,
    );
  },
};
