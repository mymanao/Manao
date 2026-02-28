import "@/client/twitch";
import { run } from "@/client/discord";
import { startServer } from "./server";
import { DISCORD, KICK } from "@/config.ts";
import { startKickBot } from "@/client/kick";
import { initDatabase } from "@helpers/database.ts";

initDatabase();

if (DISCORD.ENABLED) {
  await run();
}

startServer();

if (KICK.ENABLED) {
  await startKickBot();
}
