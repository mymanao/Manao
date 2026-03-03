import { dirname, importx } from "@discordx/importer";
import { logger } from "@helpers/logger.ts";
import {
  Events,
  IntentsBitField,
  type Interaction,
  type Message,
} from "discord.js";
import { Client } from "discordx";
import { DISCORD } from "@/config.ts";
import { addBalance, getUserConfig, initAccount } from "@helpers/database.ts";

const config = await getUserConfig();
const { chatReward } = config;
const cooldowns = new Map<string, number>();

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
  if (message.author.bot) return;

  const discordID = message.author.id;
  const id = initAccount({ userID: discordID, platform: "discord" });

  const now = Date.now();
  const lastReward = cooldowns.get(id) ?? 0;

  if (now - lastReward > chatReward.discord.cooldown * 1000) {
    if (Math.random() < chatReward.discord.chance) {
      const amount =
        Math.floor(
          Math.random() * (chatReward.discord.max - chatReward.discord.min + 1),
        ) + chatReward.discord.min;
      addBalance(id, amount);
    }
    cooldowns.set(id, now);
  }

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
