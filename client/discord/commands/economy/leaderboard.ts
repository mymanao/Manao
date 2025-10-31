import { Category } from "@discordx/utilities";
import { db } from "@helpers/database";
import { templateEmbed } from "@helpers/embed";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { apiClient } from "@/client/twitch";
import type { UserData } from "@/types";

@Discord()
@Category("Economy")
export class LeaderboardCommand {
  @Slash({
    name: "leaderboard",
    description: "View the top richest users",
  })
  async leaderboard(interaction: CommandInteraction) {
    const lang = getLang();
    const currency = getCurrency();

    await interaction.deferReply();

    const stmt = db.prepare("SELECT * FROM users ORDER BY money DESC LIMIT 5");
    const leaderboard = stmt.all() as Array<UserData>;

    if (leaderboard.length === 0) {
      await interaction.editReply({
        embeds: [
          templateEmbed({
            type: "default",
            title: t("discord.leaderboard.title", lang),
            description: t("discord.leaderboard.noUserFound", lang),
            interaction,
          }),
        ],
      });
      return;
    }

    const fields = await Promise.all(
      leaderboard
        .filter((n) => n.user !== null)
        .map(async (user, index) => {
          const username =
            (await apiClient.users.getUserById(user.user))?.name || user.user;
          return {
            name: `#${index + 1} - ${username}`,
            value: `${user.money} ${currency}`,
            inline: false,
          };
        }),
    );

    await interaction.editReply({
      embeds: [
        templateEmbed({
          type: "default",
          title: t("discord.leaderboard.title", lang),
          fields,
          interaction,
        }),
      ],
    });
  }
}
