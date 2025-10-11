import {
  addBalance,
  getBalance,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    if (!args[0] || !args[1]) throw new Error();

    initAccount(meta.userID);

    let amount = Math.trunc(parseInt(args[0], 10));
    const times = Math.trunc(parseInt(args[1], 10));

    if (Number.isNaN(amount) || amount <= 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`,
      );
      return;
    }

    if (Number.isNaN(times) || times <= 0 || times > 100) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidTimes", meta.lang)}`,
      );
      return;
    }

    let currentBalance = getBalance(meta.userID);
    let totalWon = 0;
    let totalLost = 0;

    for (let i = 0; i < times; i++) {
      if (currentBalance <= 0) break;
      if (amount > currentBalance) amount = currentBalance;

      const win = Math.random() < 0.32;
      const multiplier = win ? 2 : 1;
      const resultBalance = amount * multiplier;

      if (win) {
        addBalance(meta.userID, resultBalance);
        totalWon += resultBalance;
      } else {
        subtractBalance(meta.userID, resultBalance);
        totalLost += resultBalance;
      }

      currentBalance = getBalance(meta.userID);
    }

    await client.chat.say(
      meta.channel,
      `@${meta.user} 🎲 ${t(
        "economy.autobetResult",
        meta.lang,
        times,
        totalWon,
        totalLost,
        currentBalance,
        meta.currency,
      )}`,
    );
  },
};
