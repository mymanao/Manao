import { Category } from "@discordx/utilities";
import {
  addBalance,
  getBalance,
  getTwitchID,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { templateEmbed } from "@helpers/embed.ts";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  MessageFlagsBitField,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { io } from "@/server";

@Discord()
@Category("Economy")
export class GambleCommand {
  @Slash({
    name: "gamble",
    description: "For you, gambling addict",
  })
  async gamble(
    @SlashOption({
      name: "amount",
      description: "Amount of money to gamble",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    amountInput: string | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
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
            description: t("discord.link.errorUserNotLinked", lang),
          }),
        ],
      });
      return;
    }
    const currency = getCurrency();
    const amountStr = amountInput ?? "1";

    let amount = Math.trunc(parseInt(amountStr, 10));

    if ((Number.isNaN(amount) || amount < 0) && amountStr !== "all") {
      await interaction.editReply(
        `@${user.username} ${t("economy.errorInvalidAmount", lang)}`,
      );
      return;
    }

    initAccount(userID);

    const balance = getBalance(userID);

    if (amount > balance && amountStr !== "all") {
      await interaction.editReply(
        `@${user.username} ${t("economy.errorInsufficientFunds", lang)}`,
      );
      return;
    }

    if (amountStr === "all") {
      amount = balance;
    }

    const win = Math.random() >= 0.5;
    const multiplier = win ? 2 : 1;
    const resultBalance = amount * multiplier;

    if (win) {
      addBalance(userID, resultBalance);
      await interaction.editReply(
        `@${user.username} 🎉 ${t(
          "economy.gambleWin",
          lang,
          resultBalance,
          currency,
          balance + resultBalance,
          currency,
        )}`,
      );
      io.emit("feed", {
        type: "success",
        icon: "🎰",
        message: user.username,
        action: `+ ${amount * 1.75} ${currency}`,
      });
    } else {
      subtractBalance(userID, resultBalance);
      await interaction.editReply(
        `@${user.username} ❌ ${t(
          "economy.gambleLose",
          lang,
          resultBalance,
          currency,
          balance - resultBalance,
          currency,
        )}`,
      );
      io.emit("feed", {
        type: "danger",
        icon: "🎰",
        message: user.username,
        action: `- ${amount} ${currency}`,
      });
    }
  }
}
