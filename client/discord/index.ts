import { dirname, importx } from "@discordx/importer";
import { logger } from "@helpers/logger.ts";
import {
  Events,
  IntentsBitField,
  type Interaction,
  type Message,
} from "discord.js";
import { Client } from "discordx";
import { DISCORD, PREFIX } from "@/config.ts";

export const bot = new Client({
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],

  silent: true,

  simpleCommand: {
    prefix: PREFIX,
  },
});

bot.once(Events.ClientReady, async () => {
  await bot.guilds.fetch();
  void bot.initApplicationCommands();
  logger.info("[Manao] Discord bot is ready");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  void bot.executeCommand(message);
});

export async function run() {
  if (!DISCORD.ENABLED) return;
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  if (!DISCORD.BOT_TOKEN) {
    throw Error(
      "[Manao] Discord feature is enabled, but the DISCORD_BOT_TOKEN is not provided.",
    );
  }

  await bot.login(DISCORD.BOT_TOKEN);
}
