import { Category } from "@discordx/utilities";
import {
  addBalance,
  getBalance,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  type User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { io } from "@/server";

@Discord()
@Category("Economy")
export class GiveCommand {
  static metadata = {
    name: { en: "give", th: "" },
    description: {
      en: "Give money to someone else",
      th: "",
    },
    args: [
      {
        name: { en: "user", th: "" },
        description: {
          en: "The user you want to give money",
          th: "",
        },
      },
    ],
  };

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
    const lang = await getLang();
    await interaction.deferReply();

    const senderId = initAccount({
      userID: interaction.user.id,
      platform: "discord",
    });
    const receiverId = initAccount({
      userID: targetUser.id,
      platform: "discord",
    });

    if (senderId === receiverId) {
      await interaction.editReply(t("economy.errorSelfTransfer", lang));
      return;
    }

    const amount = Math.trunc(parseInt(amountInput, 10));
    if (Number.isNaN(amount) || amount <= 0) {
      await interaction.editReply(t("economy.errorInvalidAmount", lang));
      return;
    }

    const senderBalance = getBalance(senderId);
    if (amount > senderBalance) {
      await interaction.editReply(t("economy.errorInsufficientFunds", lang));
      return;
    }

    subtractBalance(senderId, amount);
    addBalance(receiverId, amount);

    const currency = await getCurrency();

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
