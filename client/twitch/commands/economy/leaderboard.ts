import { db } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta, UserData } from "@/types";

export default {
  name: { en: "leaderboard", th: "อันดับ" },
  description: { en: "View the leaderboard", th: "ดูอันดับคะแนน" },
  aliases: { en: ["leader", "ld", "lb", "top", "baltop"], th: [] },
  args: [],
  execute: async (client: ClientServices, meta: CommandMeta) => {
    const stmt = db.prepare("SELECT * FROM users ORDER BY money DESC LIMIT 5");
    const leaderboard = stmt.all() as Array<UserData>;

    // Batch fetch all users in a single API call instead of N individual calls
    const userIDs = leaderboard.map((u) => u.user);
    const users = await client.api.users.getUsersByIds(userIDs);
    const userMap = new Map(users.map((u) => [u.id, u.displayName]));

    let message = t("economy.leaderboardTitle", meta.lang);
    for (const [index, user] of leaderboard.entries()) {
      const username = userMap.get(user.user) ?? user.user;
      message += `${index + 1}. ${username} - ${user.money}${meta.currency} | `;
    }
    await client.chat.say(meta.channel, message);
  },
};
