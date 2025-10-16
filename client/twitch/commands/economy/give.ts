import {
  addBalance,
  getBalance,
  initAccount,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "give", th: "ให้เงิน" },
  description: { en: "Give money to someone else", th: "ให้เงินผู้อื่น" },
  aliases: { en: ["transfer"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to give money",
        th: "ผู้ใช้ที่คุณต้องการให้เงิน",
      },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "The amount of money you want to give",
        th: "จำนวนเงินที่คุณต้องการให้",
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
    const amount = Math.trunc(parseInt(args[1] ?? "0", 10));
    const [target] = args;

    if (!target) throw new Error();

    if (Number.isNaN(amount) || amount < 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`,
      );
      return;
    }

    let balance = getBalance(meta.userID);
    if (!balance) {
      initAccount(meta.userID);
      balance = 0;
    }

    if (amount > balance) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInsufficientFunds", meta.lang)}`,
      );
      return;
    }

    const targetUser = await client.api.users.getUserByName(target);
    if (!targetUser) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorUserNotFound", meta.lang, target)}`,
      );
      return;
    }
    const targetID = targetUser.id;
    initAccount(targetID);

    subtractBalance(meta.userID, amount);
    addBalance(targetID, amount);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("economy.transactionSuccess", meta.lang, amount, meta.currency, target)}`,
    );
    client.io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `${meta.user} ➡ ${target}`,
      action: `${amount} ${meta.currency}`,
    });
  },
};
