import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "stream", th: "ชื่อสตรีม" },
  description: { en: "Change the stream's name", th: "เปลี่ยนชื่อของสตรีม" },
  aliases: { en: ["s"], th: ["สตรีม"] },
  args: [
    {
      name: { en: "name", th: "ชื่อใหม่" },
      description: {
        en: "The name you want to change to",
        th: "ชื่อที่คุณต้องการเปลี่ยน",
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
    await client.api.channels.updateChannelInfo(meta.channelID, {
      title: args.join(" "),
    });

    await client.chat.say(
      meta.channel,
      t("moderation.streamTitleChanged", meta.lang, args.join(" ")),
    );
  },
};
