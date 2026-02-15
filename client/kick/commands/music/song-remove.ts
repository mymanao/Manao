import { t } from "@helpers/i18n";
import { songQueue } from "@twitch/services/chat";
import { io } from "@/server";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "song-remove", th: "ลบเพลง" },
  description: {
    en: "Remove a song",
    th: "ลบเพลงออกจากคิว",
  },
  aliases: { en: ["remove", "rm"], th: ["ลบ"] },

  args: [
    {
      name: { en: "index", th: "ลำดับ" },
      description: {
        en: "The index of the song to remove",
        th: "ลำดับของเพลงที่ต้องการลบ",
      },
      required: true,
    },
  ],

  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    if (!args[0]) return;

    const index = parseInt(args[0], 10);

    if (Number.isNaN(index) || index <= 0 || !songQueue[index]) {
      await context.reply(
        `@${meta.user} ${t("song.errorSongIndex", meta.lang)}`,
      );
      return;
    }

    const targetSong = songQueue[index];

    const badges = context.event.sender?.identity?.badges ?? [];

    const isModerator = badges.some((b: any) => b.type === "moderator");
    const isBroadcaster =
      context.event.sender.user_id === context.event.broadcaster.user_id;

    const isOwner = targetSong.user === meta.user;

    if (!isOwner && !isModerator && !isBroadcaster) {
      await context.reply(
        `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
      );
      return;
    }

    const songTitle = targetSong.song.title;

    songQueue.splice(index, 1);

    io.emit("songQueue", songQueue);

    const remaining = songQueue.length - 1;

    const queueStatus =
      remaining <= 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, remaining);

    await context.reply(
      `@${meta.user} ${t(
        "song.songRemoved",
        meta.lang,
        index,
        songTitle,
        queueStatus,
      )}`,
    );
  },
};
