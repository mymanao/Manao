import {
  addBalance,
  subtractBalance,
  getInfoFromKickID,
  initAccountFromKick,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";
import { io } from "@/server";

export default {
  name: { en: "gamble", th: "พนัน" },
  description: {
    en: "For you, gambling addict",
    th: "สำหรับคนติดพนันอย่างคุณ",
  },
  aliases: { en: ["bet"], th: [] },
  args: [
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "Amount of money to gamble",
        th: "จำนวนเงินที่ต้องการพนัน",
      },
      required: false,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const userID = meta.userID.toString();

    initAccountFromKick(userID);

    const userInfo = getInfoFromKickID(userID);
    const lang = getLang();
    const currency = getCurrency();

    if (!userInfo) {
      await context.reply(
        `@${meta.user} ${t("economy.errorAccountNotFound", lang, meta.user)}`,
      );
      return;
    }

    let amount =
      args[0] === "all"
        ? userInfo.money
        : Math.trunc(parseInt(args[0] ?? "1", 10));

    if (args[0] !== "all" && (Number.isNaN(amount) || amount <= 0)) {
      await context.reply(
        `@${meta.user} ${t("economy.errorInvalidAmount", lang)}`,
      );
      return;
    }

    if (amount > userInfo.money) {
      await context.reply(
        `@${meta.user} ${t("economy.errorInsufficientFunds", lang)}`,
      );
      return;
    }

    const win = Math.random() >= 0.5;
    const multiplier = win ? 2 : 1;
    const resultAmount = amount * multiplier;

    if (win) {
      addBalance(userID, resultAmount);

      const newBalance = userInfo.money + resultAmount;

      await context.reply(
        `@${meta.user} 🎉 ${t(
          "economy.gambleWin",
          lang,
          resultAmount,
          currency,
          newBalance,
          currency,
        )}`,
      );

      io.emit?.("feed", {
        type: "success",
        icon: "🎰",
        message: meta.user,
        action: `+ ${amount} ${currency}`,
      });
    } else {
      subtractBalance(userID, amount);

      const newBalance = userInfo.money - amount;

      await context.reply(
        `@${meta.user} ❌ ${t(
          "economy.gambleLose",
          lang,
          amount,
          currency,
          newBalance,
          currency,
        )}`,
      );

      io.emit?.("feed", {
        type: "danger",
        icon: "🎰",
        message: meta.user,
        action: `- ${amount} ${currency}`,
      });
    }
  },
};
