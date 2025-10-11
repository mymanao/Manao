import { t } from "@helpers/i18n";
import { songQueue } from "@twitch/services/chat";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "song-playing", th: "เพลงปัจจุบัน" },
  description: {
    en: "Display the currently playing song",
    th: "แสดงเพลงที่กำลังเล่นอยู่",
  },
  aliases: { en: ["playing", "nowplaying", "np"], th: ["เพลงอะไร", "เพลงไร"] },
  execute: async (client: ClientServices, meta: CommandMeta) => {
    if (songQueue.length === 0 || !songQueue[0]) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.queueEmpty", meta.lang)}`,
      );
      return;
    }

    const [currentSong] = songQueue;
    const songTitle = currentSong.song.title;
    const songAuthor = currentSong.song.author;
    const songUser = currentSong.user;

    const queueStatus =
      songQueue.length - 1 === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songPlaying", meta.lang, songTitle, songAuthor, songUser)} (${queueStatus})`,
    );
  },
};
