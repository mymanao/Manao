import { t } from "@helpers/i18n.ts";
import { updateLang } from "@helpers/preferences.ts";
import type { ClientServices, CommandMeta } from "@/types";

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
      description: { en: "Language code (en/th)", th: "รหัสภาษา (en/th)" },
      required: false,
    },
  ],
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ) => {
    const [lang] = args;

    if (!lang || meta.userID !== meta.channelID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.currentLanguage", meta.lang, meta.lang === "en" ? "English" : "ไทย")}`,
      );
      return;
    }

    const requestedLang = lang.toLowerCase();

    if (requestedLang !== "en" && requestedLang !== "th") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorInvalidLanguage", meta.lang, "en, th")}`,
      );
      return;
    }

    updateLang(requestedLang);

    const languageName = requestedLang === "en" ? "English" : "ไทย";
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentLanguageChanged", requestedLang, languageName)}`,
    );
  },
};
