import { DISCORD, KICK, TWITCH } from "@/config.ts";
import {
  customCommands,
  fetchCustomCommands,
  initDatabase,
} from "@helpers/database.ts";
import { startServer } from "@/server";

initDatabase();

for (const [key, cmd] of fetchCustomCommands()) {
  customCommands.set(key, cmd);
}

if (TWITCH.ENABLED) {
  await import("./client/twitch/index.ts");
}

if (DISCORD.ENABLED) {
  const { run } = await import("@/client/discord");
  await run();
}

if (KICK.ENABLED) {
  const { startKickBot } = await import("@/client/kick");
  await startKickBot();
}

startServer();
