import { Category } from "@discordx/utilities";
import { getBalance, getLinkedID } from "@helpers/database";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import { type CommandInteraction, MessageFlagsBitField } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
@Category("Economy")
export class BalanceCommand {
  static metadata = {
    name: { en: "balance", th: "" },
    description: {
      en: "Check your balance",
      th: "ตรวจสอบยอดเงิน",
    },
  };

  @Slash({
    name: "balance",
    description: "Check your balance",
  })
  async balance(interaction: CommandInteraction): Promise<void> {
    const lang = await getLang();

    await interaction.deferReply({
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });

    const id = getLinkedID({
      userID: interaction.user.id,
      platform: "discord",
    })!;

    const balance = getBalance(id);
    const currency = await getCurrency();

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
