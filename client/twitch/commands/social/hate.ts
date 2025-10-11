import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "hate", th: "เกลียด" },
  description: { en: "For whom do you hate?", th: "คุณเกลียดใคร?" },
  aliases: { en: [], th: ["เกลียด"] },
  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: { en: "The user you hate", th: "ผู้ใช้ที่คุณเกลียด" },
      required: false,
    },
  ],
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const hatePercent = Math.floor(Math.random() * 101);
    await client.chat.say(
      meta.channel,
      `${meta.user} 👿 ${args[0] || meta.user} ${hatePercent}%`,
    );
  },
};
