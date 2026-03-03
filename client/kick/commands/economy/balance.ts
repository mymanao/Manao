import { getBalance, initAccount } from "@helpers/database";
import { t } from "@helpers/i18n";
import { getCurrency, getLang } from "@helpers/preferences";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "balance", th: "ยอดเงิน" },
  description: {
    en: "Check your balance",
    th: "ตรวจสอบยอดเงินของคุณ",
  },
  aliases: {
    en: ["bal", "money"],
    th: [],
  },
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
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    _args: string[],
  ): Promise<void> => {
    const id = initAccount({ userID: meta.userID.toString(), platform: "kick" });
    const lang = await getLang();
    const currency = await getCurrency();
    const balance = getBalance(id);

    await context.reply(
      `@${meta.user} ${t("economy.currentBalance", lang, balance, currency)}`,
    );
  },
};
