import { t } from "@helpers/i18n";
import { updateLang } from "@helpers/preferences";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "language", th: "ภาษา" },
  description: {
    en: "Set your preferred language",
    th: "ตั้งค่าภาษาที่คุณต้องการ",
  },
  aliases: { en: ["lang"], th: [] },

  args: [
    {
      name: { en: "language", th: "ภาษา" },
      description: {
        en: "Language code (en/th)",
        th: "รหัสภาษา (en/th)",
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
    const [lang] = args;

    if (!lang) {
      await context.reply(
        `@${meta.user} ${t(
          "configuration.currentLanguage",
          meta.lang,
          meta.lang === "en" ? "English" : "ไทย",
        )}`,
      );
      return;
    }

    const requestedLang = lang.toLowerCase();

    if (requestedLang !== "en" && requestedLang !== "th") {
      await context.reply(
        `@${meta.user} ${t(
          "configuration.errorInvalidLanguage",
          meta.lang,
          "en, th",
        )}`,
      );
      return;
    }

    updateLang(requestedLang as "en" | "th");

    const languageName = requestedLang === "en" ? "English" : "ไทย";

    await context.reply(
      `@${meta.user} ${t(
        "configuration.currentLanguageChanged",
        requestedLang,
        languageName,
      )}`,
    );
  },
};
