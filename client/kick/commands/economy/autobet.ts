import {
  addBalance,
  subtractBalance,
  getInfoFromKickID,
  initAccountFromKick,
  getBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "autobet", th: "พนันอัตโนมัติ" },
  description: {
    en: "Automatically gamble multiple times",
    th: "พนันอัตโนมัติหลายครั้ง",
  },
  aliases: { en: ["ab"], th: [] },
  args: [
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "Amount of money per bet",
        th: "จำนวนเงินต่อการพนัน",
      },
      required: true,
    },
    {
      name: { en: "times", th: "จำนวนครั้ง" },
      description: {
        en: "Number of times to auto-bet",
        th: "จำนวนครั้งที่จะพนันอัตโนมัติ",
      },
      required: true,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    if (!args[0] || !args[1]) return;

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

    let amount = Math.trunc(parseInt(args[0], 10));
    const times = Math.trunc(parseInt(args[1], 10));

    if (Number.isNaN(amount) || amount <= 0) {
      await context.reply(
        `@${meta.user} ${t("economy.errorInvalidAmount", lang)}`,
      );
      return;
    }

    if (Number.isNaN(times) || times <= 0 || times > 100) {
      await context.reply(
        `@${meta.user} ${t("economy.errorInvalidTimes", lang)}`,
      );
      return;
    }

    let currentBalance = getBalance(userID);
    let totalWon = 0;
    let totalLost = 0;

    for (let i = 0; i < times; i++) {
      if (currentBalance <= 0) break;

      if (amount > currentBalance) {
        amount = currentBalance;
      }

      const win = Math.random() < 0.32;
      const multiplier = win ? 2 : 1;
      const resultAmount = amount * multiplier;

      if (win) {
        addBalance(userID, resultAmount);
        totalWon += resultAmount;
      } else {
        subtractBalance(userID, resultAmount);
        totalLost += resultAmount;
      }

      currentBalance = getBalance(userID);
    }

    await context.reply(
      `@${meta.user} 🎲 ${t(
        "economy.autobetResult",
        lang,
        times,
        totalWon,
        totalLost,
        currentBalance,
        currency,
      )}`,
    );
  },
};
