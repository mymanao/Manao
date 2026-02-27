import { getDefaultSong } from "@helpers/preferences.ts";
import { songQueue } from "@twitch/services/chat";
import type { Elysia } from "elysia";

export function registerMusicAPI(app: Elysia) {
  app.get("/api/queue", () => songQueue);

  app.get("/api/defaultSong", () => {
    const defaultSong = getDefaultSong();
    return defaultSong ?? [];
  });
  return app;
}
