import { t } from "@helpers/i18n";
import { songQueue } from "@twitch/services/chat";
import { io } from "@/server";
import type { KickItContext } from "@manaobot/kickit/types";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "song-skip", th: "ข้ามเพลง" },
  description: {
    en: "Skip a song",
    th: "ข้ามเพลงปัจจุบัน",
  },
  aliases: { en: ["skip", "sk"], th: ["ข้าม"] },

  execute: async (context: KickItContext, meta: CommandMeta): Promise<void> => {
    if (songQueue.length === 0 || !songQueue[0]) {
      await context.reply(`@${meta.user} ${t("song.queueEmpty", meta.lang)}`);
      return;
    }

    const currentSong = songQueue[0];

    const badges = context.event.sender?.identity?.badges ?? [];
    const isModerator = badges.some((b: any) => b.type === "moderator");
    const isBroadcaster =
      context.event.sender.user_id === context.event.broadcaster.user_id;

    const isOwner = currentSong.user === meta.user;

    if (!isOwner && !isModerator && !isBroadcaster) {
      await context.reply(
        `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
      );
      return;
    }

    const songTitle = currentSong.song.title;

    songQueue.shift();

    io.emit("songSkip", songQueue);

    const queueStatus =
      songQueue.length === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length);

    await context.reply(
      `@${meta.user} ${t(
        "song.songSkipped",
        meta.lang,
        1,
        songTitle,
        queueStatus,
      )}`,
    );
  },
};
