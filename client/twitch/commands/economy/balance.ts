import { getBalance, initAccount } from "@helpers/database";
import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

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

    initAccount({ userID: user.id, platform: "twitch" });

    const balance = getBalance(user.id);

    client.io.emit("feed", {
      type: "normal",
      icon: "👛",
      message: `${meta.user}`,
      action: `${balance} ${meta.currency}`,
    });
    await client.chat.say(
      meta.channel,
      `${user.displayName} ${t("economy.currentBalance", meta.lang, balance, meta.currency)}`,
    );
  },
};
