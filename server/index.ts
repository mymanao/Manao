import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { registerCommandsAPI } from "@server/api/commands.ts";
import { registerConfigAPI } from "@server/api/config.ts";
import { registerCustomCommandAPI } from "@server/api/custom-commands.ts";
import { registerMusicAPI } from "@server/api/music.ts";
import { registerRewardsAPI } from "@server/api/rewards.ts";
import { registerSoundboardAPI } from "@server/api/soundboard.ts";
import { registerOverlayRoutes } from "@server/routes/overlay.ts";
import { registerPageRoutes } from "@server/routes/page.ts";
import { Elysia } from "elysia";
import { DIR, PORT } from "@/config";
import { io } from "@server/services/socket.io.ts";
import { registerLinkAPI } from "@server/api/link.ts";

const app = new Elysia();

app.use(html());
app.use(
  staticPlugin({
    prefix: "/",
    assets: DIR.PUBLIC,
  }),
);

app.get("/scripts/socket.io/socket.io.js", () => {
  return Bun.file("./node_modules/socket.io/client-dist/socket.io.js");
});

registerPageRoutes(app);
await registerOverlayRoutes(app);

registerMusicAPI(app);
registerCommandsAPI(app);
registerConfigAPI(app);
registerCustomCommandAPI(app);
await registerRewardsAPI(app);
registerSoundboardAPI(app);
registerLinkAPI(app);

function startServer() {
  app.listen(
    {
      port: PORT,
      tls: {},
    },
    ({ hostname, port }) => {
      console.log(`[Elysia] Running on http://${hostname}:${port}`);
    },
  );
}

export { startServer, io, app };
