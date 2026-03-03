import { Category } from "@discordx/utilities";
import {
  getBalance,
  addBalance,
  subtractBalance,
  initAccount,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { io } from "@/server";

@Discord()
@Category("Economy")
export class GambleCommand {
  static metadata = {
    name: { en: "gamble", th: "" },
    description: {
      en: "Gamble your money with 50% chance to win",
      th: "",
    },
    args: [
      {
        name: { en: "amount", th: "" },
        description: {
          en: "Amount of money to gamble",
          th: "",
        },
      },
    ],
  };

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

    await interaction.deferReply();

    const id = initAccount({
      userID: interaction.user.id,
      platform: "discord",
    });
    const currency = getCurrency();
    const amountStr = amountInput ?? "1";

    let amount = Math.trunc(parseInt(amountStr, 10));

    if ((Number.isNaN(amount) || amount < 0) && amountStr !== "all") {
      await interaction.editReply(
        `@${interaction.user.username} ${t("economy.errorInvalidAmount", lang)}`,
      );
      return;
    }

    const balance = getBalance(id);

    if (amount > balance && amountStr !== "all") {
      await interaction.editReply(
        `@${interaction.user.username} ${t("economy.errorInsufficientFunds", lang)}`,
      );
      return;
    }

    if (amountStr === "all") {
      amount = balance;
    }

    const win = Math.random() >= 0.5;

    if (win) {
      addBalance(id, amount);
      await interaction.editReply(
        `@${interaction.user.username} 🎉 ${t(
          "economy.gambleWin",
          lang,
          amount,
          currency,
          balance + amount,
          currency,
        )}`,
      );
      io.emit("feed", {
        type: "success",
        icon: "🎰",
        message: interaction.user.username,
        action: `+ ${amount} ${currency}`,
      });
    } else {
      subtractBalance(id, amount);
      await interaction.editReply(
        `@${interaction.user.username} ❌ ${t(
          "economy.gambleLose",
          lang,
          amount,
          currency,
          balance - amount,
          currency,
        )}`,
      );
      io.emit("feed", {
        type: "danger",
        icon: "🎰",
        message: interaction.user.username,
        action: `- ${amount} ${currency}`,
      });
    }
  }
}
