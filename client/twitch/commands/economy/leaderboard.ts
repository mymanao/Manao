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
    let message = t("economy.leaderboardTitle", meta.lang);
    for (const user of leaderboard) {
      const index: number = leaderboard.indexOf(user);
      const username = (await client.api.users.getUserById(user.user))
        ?.displayName;
      message += `${index + 1}. ${username} - ${user.money}${meta.currency} | `;
    }
    await client.chat.say(meta.channel, message);
  },
};
