import { Elysia } from "elysia";
import { pendingLinks } from "@discord/commands/preferences/link.ts";

export function registerLinkAPI(app: Elysia) {
  app.get("/api/link/:code", ({ params, status }) => {
    const { code } = params as unknown as { code: string };

    if (!code) {
      return status(400);
    }
    const entry = [...pendingLinks.entries()].find(
      ([, data]) =>
        data.code === code && Date.now() - data.createdAt < 5 * 60 * 1000,
    );
    if (!entry) return status(404);

    const [_, data] = entry;
    return status(200, data);
  });

  app.get("/api/link/:code/delete", ({ params, status }) => {
    const { code } = params as unknown as { code: string };

    if (!code) {
      return status(400);
    }

    const entry = [...pendingLinks.entries()].find(
      ([, data]) => data.code === code,
    );
    if (!entry) return status(404);

    const [discordID] = entry;
    pendingLinks.delete(discordID);
    return status(200);
  });
}
