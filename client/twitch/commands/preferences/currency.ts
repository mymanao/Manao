import { t } from "@helpers/i18n";
import { updateCurrency } from "@helpers/preferences";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "currency", th: "สกุลเงิน" },
  description: {
    en: "Change the channel's currency",
    th: "เปลี่ยนสกุลเงินของช่อง",
  },
  aliases: { en: [], th: [] },
  args: [
    {
      name: { en: "currency", th: "สกุลเงิน" },
      description: {
        en: "Currency to set",
        th: "สกุลเงินที่ต้องการตั้งค่า",
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
    const [currency] = args;

    if (!currency) {
      await client.chat.say(
        meta.channel,
        t("configuration.currentCurrency", meta.lang, meta.currency),
      );
      return;
    }
    if (meta.user !== meta.channel) {
      await client.chat.say(
        meta.channel,
        t("configuration.errorPermission", meta.lang),
      );
      return;
    }

    updateCurrency(currency);

    await client.chat.say(
      meta.channel,
      t("configuration.currentCurrencyChanged", meta.lang, currency),
    );
  },
};
