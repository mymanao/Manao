import { t } from "@helpers/i18n";
import {
  getYouTubeVideoInfo,
  isPlaylistUrl,
  searchYoutubeVideo,
} from "@helpers/youtube";
import { songQueue } from "@twitch/services/chat";
import type { ClientServices, CommandMeta, SongRequestData } from "@/types";

export default {
  name: { en: "song-request", th: "ขอเพลง" },
  description: { en: "Request a song", th: "ขอเพลงที่ต้องการ" },
  aliases: { en: ["sr"], th: ["ข", "ขอ"] },
  args: [
    {
      name: { en: "song", th: "เพลง" },
      description: {
        en: "The song you want to request",
        th: "เพลงที่คุณต้องการขอ",
      },
      required: true,
    },
  ],
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ) => {
    const songQuery = args.join(" ");
    const result = await searchYoutubeVideo(songQuery);

    if (!result || isPlaylistUrl(result.url)) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongRequestPlaylist", meta.lang)}`,
      );
      return;
    }

    const info = await getYouTubeVideoInfo(result.videoId);
    if (!info || info.lengthSeconds > 600 || info.isLiveContent) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    const inQueue = songQueue.findIndex(
      (item: SongRequestData) => item.song.id === info.videoId,
    );
    if (inQueue !== -1) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongAlreadyInQueue", meta.lang, inQueue + 1)}`,
      );
      return;
    }

    const songData = {
      user: meta.user,
      song: {
        title: info.title,
        author: info.author,
        thumbnail: info.thumbnail,
        id: info.videoId,
      },
    };

    songQueue.push(songData);
    client.io.emit("songRequest", {
      index: songQueue.length - 1,
      queue: songQueue,
    });

    const queuePosition =
      songQueue.length - 1 === 0
        ? t("song.songCurrentlyPlaying", meta.lang)
        : t("song.queueAt", meta.lang, songQueue.length - 1);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("song.songAdded", meta.lang, info.title, info.author, queuePosition)}`,
    );
  },
};
