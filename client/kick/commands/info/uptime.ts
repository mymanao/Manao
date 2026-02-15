import { t } from "@helpers/i18n";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "uptime", th: "เวลาสตรีม" },
  description: {
    en: "Get the current uptime of the stream",
    th: "ตรวจสอบระยะเวลาที่สตรีมเปิดอยู่",
  },

  execute: async (context: KickItContext, meta: CommandMeta): Promise<void> => {
    const response = await context.client.api.livestreams.get();
    const stream = response?.data[0];

    if (!stream) {
      await context.reply(`@${meta.user} ${t("info.offline", meta.lang)}`);
      return;
    }

    const startedAt = new Date(stream.started_at);
    const now = new Date();

    const diff = now.getTime() - startedAt.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const formattedUptime = [
      days > 0 ? `${days} วัน` : "",
      hours > 0 ? `${hours % 24} ${t("info.hours", meta.lang)}` : "",
      minutes > 0 ? `${minutes % 60} ${t("info.minutes", meta.lang)}` : "",
      seconds > 0 ? `${seconds % 60} ${t("info.seconds", meta.lang)}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    await context.reply(
      `@${meta.user} ${t("info.uptime", meta.lang, formattedUptime)}`,
    );
  },
};
