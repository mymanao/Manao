import "@/client/twitch";
import { initDiscordBot } from "@/client/discord";
import { startServer } from "./server";

startServer();
initDiscordBot();
