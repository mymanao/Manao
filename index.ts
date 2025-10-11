import { main } from "@/client/twitch";
import { startServer } from "./server";

startServer();
await main();
