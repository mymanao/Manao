import { logger } from "@helpers/logger.ts";
import Eris from "eris";
import { DISCORD, PREFIX } from "@/config.ts";

const bot = Eris(DISCORD.BOT_TOKEN, {
  intents: ["messageContent", "guildMessages"],
});

export async function initDiscordBot(): Promise<void> {
  if (!DISCORD.ENABLED) return;

  bot.on("ready", () => {
    logger.info(`[Manao] Discord bot ready, as ${bot.user.username}`);
  });

  await bot.connect();

  bot.on("messageCreate", async (message: Eris.Message) => {
    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      switch (commandName) {
        case "ping":
          await bot.createMessage(message.channel.id, "Pong!");
          break;
      }
    }
  });
}
