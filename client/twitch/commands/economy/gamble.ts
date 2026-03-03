import {
  addBalance,
  getBalance,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    let amount = Math.trunc(parseInt(args[0] ?? "1", 10));

    if ((Number.isNaN(amount) || amount < 0) && args[0] !== "all") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`,
      );
      return;
    }

    initAccount({ userID: meta.userID, platform: "twitch" });

    const balance = getBalance(meta.userID);
    if (amount > balance && args[0] !== "all") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInsufficientFunds", meta.lang)}`,
      );
      return;
    }

    if (args[0] === "all") {
      amount = balance;
    }

    const win = Math.random() >= 0.5;

    if (win) {
      addBalance(meta.userID, amount);
      await client.chat.say(
        meta.channel,
        `@${meta.user} 🎉 ${t("economy.gambleWin", meta.lang, amount, meta.currency, balance + amount, meta.currency)}`,
      );
      client.io.emit("feed", {
        type: "success",
        icon: "🎰",
        message: meta.user,
        action: `+ ${amount} ${meta.currency}`,
      });
    } else {
      subtractBalance(meta.userID, amount);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ❌ ${t("economy.gambleLose", meta.lang, amount, meta.currency, balance - amount, meta.currency)}`,
      );
      client.io.emit("feed", {
        type: "danger",
        icon: "🎰",
        message: meta.user,
        action: `- ${amount} ${meta.currency}`,
      });
    }
  },
};
