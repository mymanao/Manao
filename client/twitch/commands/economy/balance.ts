import { db, initAccount } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta, UserData } from "@/types";

export default {
  name: { en: "balance", th: "ยอดเงิน" },
  description: { en: "Check your balance", th: "ตรวจสอบยอดเงินของคุณ" },
  aliases: { en: ["bal", "money"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "User to check balance",
        th: "ผู้ใช้ที่ต้องการตรวจสอบยอดเงิน",
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
    const username = args[0] ?? meta.user;

    const user = await client.api.users.getUserByName(username);

    if (!user) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorUserNotFound", meta.lang, username)}`,
      );
      return;
    }

    initAccount(user.id);

    const stmt = db.prepare("SELECT money FROM users WHERE user = ?");
    const balance = stmt.get(user.id) as Pick<UserData, "money">;

    if (!balance) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("economy.errorAccountNotFound", meta.lang, user.displayName)}`,
      );
      return;
    }

    client.io.emit("feed", {
      type: "normal",
      icon: "👛",
      message: `${meta.user}`,
      action: `${balance.money} ${meta.currency}`,
    });
    await client.chat.say(
      meta.channel,
      `${user.displayName} ${t("economy.currentBalance", meta.lang, balance.money, meta.currency)}`,
    );
  },
};
