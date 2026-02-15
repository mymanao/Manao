import { t } from "@helpers/i18n";
import { updateCurrency } from "@helpers/preferences";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

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
  broadcasterOnly: true,
  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const [currency] = args;

    if (!currency) {
      await context.reply(
        t("configuration.currentCurrency", meta.lang, meta.currency),
      );
      return;
    }

    updateCurrency(currency);

    await context.reply(
      t("configuration.currentCurrencyChanged", meta.lang, currency),
    );
  },
};
