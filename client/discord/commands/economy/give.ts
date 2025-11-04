import { Category } from "@discordx/utilities";
import {
  addBalance,
  getBalance,
  getTwitchID,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  MessageFlagsBitField,
  type User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { io } from "@/server";

@Discord()
@Category("Economy")
export class GiveCommand {
  @Slash({
    name: "give",
    description: "Give money to someone else",
  })
  async give(
    @SlashOption({
      name: "user",
      description: "The user you want to give money",
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    targetUser: User,
    @SlashOption({
      name: "amount",
      description: "The amount of money you want to give",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    amountInput: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    const lang = getLang();
    await interaction.deferReply();

    const senderDiscordID = interaction.user.id;
    const senderTwitchID = getTwitchID(senderDiscordID);

    if (!senderTwitchID) {
      await interaction.editReply({
        embeds: [
          templateEmbed({
            type: "error",
            title: "Error",
            description: t("discord.link.errorUserNotLinked", lang),
          }),
        ],
      });
      return;
    }

    const receiverDiscordID = targetUser.id;
    const receiverTwitchID = getTwitchID(receiverDiscordID);

    if (!receiverTwitchID) {
      await interaction.editReply({
        embeds: [
          templateEmbed({
            type: "error",
            title: "Error",
            description: t("discord.link.errorTargetNotLinked", lang),
          }),
        ],
      });
      return;
    }

    const amount = Math.trunc(parseInt(amountInput, 10));
    if (Number.isNaN(amount) || amount < 0) {
      await interaction.editReply(t("economy.errorInvalidAmount", lang));
      return;
    }

    initAccount(senderTwitchID);
    initAccount(receiverTwitchID);

    const senderBalance = getBalance(senderTwitchID);
    if (amount > senderBalance) {
      await interaction.editReply(t("economy.errorInsufficientFunds", lang));
      return;
    }

    subtractBalance(senderTwitchID, amount);
    addBalance(receiverTwitchID, amount);

    const currency = getCurrency();

    await interaction.editReply(
      t(
        "economy.transactionSuccess",
        lang,
        amount,
        currency,
        targetUser.username,
      ),
    );

    io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `${interaction.user.username} ➡ ${targetUser.username}`,
      action: `${amount} ${currency}`,
    });
  }
}
