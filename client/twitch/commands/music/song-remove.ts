import { t } from "@helpers/i18n";
import { songQueue } from "@twitch/services/chat";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "song-remove", th: "ลบเพลง" },
  description: { en: "Remove a song", th: "ลบเพลงออกจากคิว" },
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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    if (!args[0]) throw new Error();

    const index = parseInt(args[0], 10);
    if (Number.isNaN(index) || index <= 0 || !songQueue[index]) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongIndex", meta.lang)}`,
      );
      return;
    }

    if (songQueue[index].user !== meta.user) {
      const isMod = await client.api.moderation.checkUserMod(
        meta.channelID,
        meta.userID,
      );
      if (!isMod && songQueue[index].user !== Bun.env.TW_CHANNEL) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("song.errorSongRemovedNoPermission", meta.lang)}`,
        );
        return;
      }
    }

    const songTitle = songQueue[index].song.title;

    songQueue.splice(index, 1);
    client.io.emit("songQueue", songQueue);

    const queueStatus =
      songQueue.length - 1 === 0
        ? t("song.queueEmpty", meta.lang)
        : t("song.queueLength", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songRemoved", meta.lang, index, songTitle, queueStatus)}`,
    );
  },
};
