import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "shoutout", th: "แนะนำ" },
  description: { en: "Shoutout to someone!", th: "แนะนำใครสักคน!" },
  aliases: { en: ["so"], th: [] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you want to shoutout",
        th: "ผู้ใช้ที่คุณต้องการแนะนำ",
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
    if (!args[0]) throw new Error();

    const userID = (await client.api.users.getUserByName(args[0]))?.id;

    if (!userID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorUserNotFound", meta.lang, args[0])}`,
      );
      return;
    }

    try {
      await client.api.chat.shoutoutUser(meta.channelID, userID);
    } catch (e) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("moderation.errorCannotShoutout", meta.lang)}`,
      );
      return;
    }
    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("moderation.shoutoutSuccess", meta.lang, args[0])}`,
    );
  },
};
