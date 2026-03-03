import {
  addBalance,
  subtractBalance,
  getBalance,
  initAccount,
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

    const id = initAccount({
      userID: meta.userID.toString(),
      platform: "kick",
    });
    const lang = await getLang();
    const currency = await getCurrency();

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

    let currentBalance = getBalance(id);
    let totalWon = 0;
    let totalLost = 0;

    for (let i = 0; i < times; i++) {
      if (currentBalance <= 0) break;

      if (amount > currentBalance) {
        amount = currentBalance;
      }

      const win = Math.random() >= 0.5;

      if (win) {
        addBalance(id, amount);
        totalWon += amount;
      } else {
        subtractBalance(id, amount);
        totalLost += amount;
      }

      currentBalance = getBalance(id);
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
