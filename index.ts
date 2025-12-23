import "@/client/twitch";
import { run } from "@/client/discord";
import { startServer } from "./server";

startServer();

await run();
