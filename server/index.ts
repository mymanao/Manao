import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { registerCommandsAPI } from "@server/api/commands.ts";
import { registerCustomCommandAPI } from "@server/api/custom-commands.ts";
import { registerMusicAPI } from "@server/api/music.ts";
import { registerOverlayRoutes } from "@server/routes/overlay.ts";
import { registerPageRoutes } from "@server/routes/page.ts";
import { initializeSocketServer } from "@server/services/socket.io.ts";
import { Elysia } from "elysia";
import { DIR, PORT } from "@/config";

const app = new Elysia();

const io = initializeSocketServer();

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
registerOverlayRoutes(app);

registerMusicAPI(app);
registerCommandsAPI(app);
registerCustomCommandAPI(app);

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
