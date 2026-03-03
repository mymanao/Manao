import { db } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "leaderboard", th: "อันดับ" },
  description: { en: "View the leaderboard", th: "ดูอันดับคะแนน" },
  aliases: { en: ["leader", "ld", "lb", "top", "baltop"], th: [] },
  args: [],
  execute: async (client: ClientServices, meta: CommandMeta) => {
    const leaderboard = db
      .prepare(`
      SELECT u.money, la.twitch_id
      FROM users u
      JOIN linked_accounts la ON la.id = u.id
      WHERE la.twitch_id IS NOT NULL
      ORDER BY u.money DESC
      LIMIT 5
    `)
      .all() as Array<{ money: number; twitch_id: string }>;

    const twitchIDs = leaderboard.map((u) => u.twitch_id);
    const users = await client.api.users.getUsersByIds(twitchIDs);
    const userMap = new Map(users.map((u) => [u.id, u.displayName]));

    let message = t("economy.leaderboardTitle", meta.lang);
    for (const [index, entry] of leaderboard.entries()) {
      const username = userMap.get(entry.twitch_id) ?? entry.twitch_id;
      message += `${index + 1}. ${username} - ${entry.money}${meta.currency} | `;
    }
    await client.chat.say(meta.channel, message);
  },
};
