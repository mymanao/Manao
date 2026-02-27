import {
  addBalance,
  db,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta, UserData } from "@/types";

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

    initAccount(meta.userID);

    const stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    const balance = stmt.get(meta.userID) as Pick<UserData, "money">;
    if (amount > balance.money && args[0] !== "all") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInsufficientFunds", meta.lang)}`,
      );
      return;
    }

    if (args[0] === "all") {
      amount = balance.money;
    }

    const win = Math.random() >= 0.5;
    const multiplier = win ? 2 : 1;
    const resultBalance = amount * multiplier;

    if (win) {
      subtractBalance(meta.userID, amount);
      addBalance(meta.userID, resultBalance);
      await client.chat.say(
        meta.channel,
        `@${meta.user} 🎉 ${t("economy.gambleWin", meta.lang, resultBalance, meta.currency, balance.money + resultBalance, meta.currency)}`,
      );
      client.io.emit("feed", {
        type: "success",
        icon: "🎰",
        message: meta.user,
        action: `+ ${amount * 2} ${meta.currency}`,
      });
    } else {
      subtractBalance(meta.userID, resultBalance);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ❌ ${t("economy.gambleLose", meta.lang, resultBalance, meta.currency, balance.money - resultBalance, meta.currency)}`,
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
