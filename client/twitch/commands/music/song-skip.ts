import { t } from "@helpers/i18n";
import { songQueue } from "@twitch//services/chat";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "song-skip", th: "ข้ามเพลง" },
  description: { en: "Skip a song", th: "ข้ามเพลงปัจจุบัน" },
  aliases: { en: ["skip", "sk"], th: ["ช้าม"] },
  execute: async (client: ClientServices, meta: CommandMeta) => {
    if (songQueue.length === 0 || !songQueue[0]) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.queueEmpty", meta.lang)}`,
      );
      return;
    }

    if (songQueue[0].user !== meta.user) {
      const isMod = await client.api.moderation.checkUserMod(
        meta.channelID,
        meta.userID,
      );
      if (!isMod && songQueue[0].user !== Bun.env.TW_CHANNEL) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
        );
        return;
      }
    }

    const [skippedSong] = songQueue;
    const songTitle = skippedSong.song.title;

    songQueue.shift();
    client.io.emit("songSkip", songQueue);

    const queueStatus =
      songQueue.length === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songSkipped", meta.lang, 1, songTitle, queueStatus)}`,
    );
  },
};
