import { db } from "@helpers/database";
import { t } from "@helpers/i18n";
import { addDefaultSong, setDefaultSong } from "@helpers/preferences.ts";
import {
  getYouTubeVideoInfo,
  isPlaylistUrl,
  searchYoutubeVideo,
} from "@helpers/youtube";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "song-default", th: "เพลงเริ่มต้น" },
  description: { en: "Set a default song(s)", th: "ตั้งเพลงเริ่มต้น" },
  aliases: { en: ["sd"], th: ["เพลงเริ่ม"] },
  args: [
    {
      name: { en: "action", th: "คำสั่ง" },
      description: {
        en: "The action to perform (should be: set, add)",
        th: "คำสั่งที่ต้องการทำ (ควรเป็น: set, add)",
      },
      required: true,
    },
    {
      name: { en: "song(s)", th: "เพลง" },
      description: {
        en: "The song(s) you want to set as default, separated by commas (,)",
        th: "เพลงที่คุณต้องการตั้งเป็นเพลงเริ่มต้น, คั่นด้วยเครื่องหมายคอมม่า (,)",
      },
      required: true,
    },
  ],
  broadcasterOnly: true,
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ) => {
    const action = args[0]?.toLowerCase();

    if (action !== "set" && action !== "add") {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongInvalidAction", meta.lang)}`,
      );
      return;
    }

    const songs = args
      .slice(1)
      .join(" ")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (songs.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    const validInfos = [];
    for (const song of songs) {
      const result = await searchYoutubeVideo(song);
      if (!result || isPlaylistUrl(result.url)) continue;
      const info = await getYouTubeVideoInfo(result.videoId);
      if (!info || info.lengthSeconds > 600 || info.isLiveContent) continue;
      validInfos.push(info);
    }

    if (validInfos.length === 0) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.errorSongNotFound", meta.lang)}`,
      );
      return;
    }

    const songsData = validInfos.map((info) => ({
      title: info.title,
      author: info.author,
      thumbnail: info.thumbnail,
      id: info.videoId,
    }));

    if (action === "set") {
      setDefaultSong(songsData);
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.songDefaultSet", meta.lang, songsData.length)}`,
      );
    } else if (action === "add") {
      const updatedSongs = addDefaultSong(songsData);

      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("song.songDefaultAdd", meta.lang, updatedSongs.length)}`,
      );
    }
  },
};
