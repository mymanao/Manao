import { run } from "@/client/discord";
import { startServer } from "./server";
import { DISCORD, KICK, TWITCH } from "@/config.ts";
import { startKickBot } from "@/client/kick";
import {
  customCommands,
  fetchCustomCommands,
  initDatabase,
} from "@helpers/database.ts";

initDatabase();

for (const [key, cmd] of fetchCustomCommands()) {
  customCommands.set(key, cmd);
}

if (TWITCH.ENABLED) {
  await import("./client/twitch/index.ts");
}

if (DISCORD.ENABLED) {
  await run();
}

startServer();

if (KICK.ENABLED) {
  await startKickBot();
}
