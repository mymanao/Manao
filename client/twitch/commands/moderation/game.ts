import { t } from "@helpers/i18n";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "game", th: "เกม" },
  description: { en: "Change the stream's game", th: "เปลี่ยนเกมของสตรีม" },
  aliases: { en: ["g"], th: [] },
  args: [
    {
      name: { en: "game", th: "เกม" },
      description: {
        en: "The game you want to change to",
        th: "เกมที่คุณต้องการเปลี่ยนไป",
      },
      required: false,
    },
  ],
  modsOnly: true,
  execute: async (
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    if (!args[0]) {
      const currentGame = await client.api.channels.getChannelInfoById(
        meta.channelID,
      );
      if (!currentGame) {
        await client.chat.say(
          meta.channel,
          `@${meta.user} ${t("configuration.errorCurrentGameNotFound", meta.lang)}`,
        );
        return;
      }
      await client.chat.say(
        meta.channel,
        t("configuration.currentGame", meta.lang, currentGame.gameName),
      );
      return;
    }

    const game = await client.api.games.getGameByName(args.join(" "));

    if (!game) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorGameNotFound", meta.lang, args.join(" "))}`,
      );
      return;
    }

    await client.api.channels.updateChannelInfo(meta.channelID, {
      gameId: game.id,
    });

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.currentGameChanged", meta.lang, game.name)}`,
    );
  },
};
