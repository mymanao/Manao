import { t } from "@helpers/i18n";
import { songQueue } from "@twitch/services/chat"; // unchanged
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "song-queue", th: "คิวเพลง" },
  description: {
    en: "Check song queue",
    th: "ตรวจสอบคิวเพลง",
  },
  aliases: { en: ["queue", "sq"], th: ["คิว"] },

  args: [
    {
      name: { en: "page", th: "หน้า" },
      description: { en: "Page number", th: "หมายเลขหน้า" },
      required: false,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    if (songQueue.length === 0) {
      await context.reply(`@${meta.user} ${t("song.queueEmpty", meta.lang)}`);
      return;
    }

    const page = parseInt(args[0] || "1", 10);
    const itemsPerPage = 3;
    const charactersPerPage = 500;

    const totalPages = Math.ceil(songQueue.length / itemsPerPage);

    if (Number.isNaN(page) || page <= 0 || page > totalPages) {
      await context.reply(
        `@${meta.user} ${t("song.errorInvalidPage", meta.lang)}`,
      );
      return;
    }

    let msg = `${t("song.queuePageTitle", meta.lang, page, totalPages)} `;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const songs = songQueue.slice(start, end);

    const songList = songs
      .map((song, index) => {
        const songIndex = start + index;
        return `${songIndex}. ${song.song.title} (${song.user})`;
      })
      .filter((_, index) => start + index !== 0) // skip currently playing
      .join(" | ");

    msg += songList;

    if (songQueue.length > end) {
      msg += ` ${t("song.queuePageFooter", meta.lang, songQueue.length - end)}`;
    }

    if (msg.length > charactersPerPage) {
      msg = `${msg.slice(0, charactersPerPage - 3)}...`;
    }

    await context.reply(msg);
  },
};
