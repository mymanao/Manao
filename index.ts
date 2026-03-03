import "@/client/twitch";
import { run } from "@/client/discord";
import { startServer } from "./server";
import { DISCORD, KICK } from "@/config.ts";
import { startKickBot } from "@/client/kick";
import {
  customCommands,
  fetchCustomCommands,
  initDatabase,
  initUserConfig,
} from "@helpers/database.ts";

initDatabase();
await initUserConfig();

for (const [key, cmd] of fetchCustomCommands()) {
  customCommands.set(key, cmd);
}

if (DISCORD.ENABLED) {
  await run();
}

startServer();

if (KICK.ENABLED) {
  await startKickBot();
}
