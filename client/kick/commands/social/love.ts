import { io } from "@/server";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "love", th: "รัก" },
  description: {
    en: "How deep is your love?",
    th: "ความรักของคุณลึกแค่ไหน?",
  },
  aliases: { en: [], th: [] },

  args: [
    {
      name: { en: "user", th: "ผู้ใช้" },
      description: {
        en: "The user you love",
        th: "ผู้ใช้ที่คุณรัก",
      },
      required: false,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    let lovePercent = String(Math.floor(Math.random() * 101));

    const target = args[0] || meta.user;

    if (
      [
        "ในหลวง",
        "พ่อหลวง",
        "พ่อ",
        "ร.๙",
        "รัชกาลที่ ๙",
        "king rama ix",
        "rama ix",
        "king",
      ].includes(target.toLowerCase())
    ) {
      lovePercent = "๙๙";
    }

    io.emit("feed", {
      type: "neutral",
      icon: "💘",
      message: `${meta.user} ➡ ${target}`,
      action: `${lovePercent}%`,
    });

    await context.reply(
      `${meta.user} 💘 ${target} ${lovePercent}%`
    );
  },
};
