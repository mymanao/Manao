import { db, initAccount, setBalance } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "set", th: "ตั้งค่าเงิน" },
  description: { en: "Set user's money", th: "ตั้งค่าเงินของผู้ใช้" },
  aliases: { en: ["s"], th: ["ตั้งเงิน"] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to set money",
        th: "ผู้ใช้ที่คุณต้องการตั้งค่าเงิน",
      },
      required: true,
    },
    {
      name: { en: "amount", th: "จำนวนเงิน" },
      description: {
        en: "The amount of money you want to set",
        th: "จำนวนเงินที่คุณต้องการตั้งค่า",
      },
      required: true,
    },
  ],
  modsOnly: true,
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const amount = Math.trunc(parseInt(args[1] ?? "-999", 10));
    const [target] = args;

    if (!target) throw new Error();

    if (Number.isNaN(amount) || amount < 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorInvalidAmount", meta.lang)}`,
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

    setBalance(meta.userID, amount);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("economy.transactionSuccess", meta.lang, target, amount, meta.currency)}`,
    );

    client.io.emit("feed", {
      type: "normal",
      icon: "📩",
      message: `System ➡ ${target}`,
      action: `${amount} ${meta.currency}`,
    });
  },
};
