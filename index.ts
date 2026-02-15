import "@/client/twitch";
import { run } from "@/client/discord";
import { startServer } from "./server";
import { KICK } from "@/config.ts";
import { startKickBot } from "@/client/kick";

await run();
startServer();

if (KICK.ENABLED) {
  await startKickBot();
}
