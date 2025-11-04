import { Category } from "@discordx/utilities";
import { getBalance, getTwitchID, initAccount } from "@helpers/database";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import { type CommandInteraction, MessageFlagsBitField } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
@Category("Economy")
export class BalanceCommand {
  @Slash({
    name: "balance",
    description: "Check your balance",
  })
  async balance(interaction: CommandInteraction): Promise<void> {
    const lang = getLang();

    await interaction.deferReply({
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });

    const user = interaction.user;
    const userID = getTwitchID(user.id);
    if (!userID) {
      await interaction.editReply({
        embeds: [
          templateEmbed({
            type: "error",
            title: "Error",
            description: t("configuration.linkSuccess", lang),
          }),
        ],
      });
      return;
    }

    initAccount(userID);
    const balance = getBalance(userID);
    const currency = getCurrency();

    await interaction.editReply({
      embeds: [
        templateEmbed({
          type: "default",
          title: t("economy.currentBalance", lang, balance, currency),
        }),
      ],
    });
  }
}
