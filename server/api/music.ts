import { getDefaultSong } from "@helpers/preferences.ts";
import { songQueue } from "@twitch/services/chat";
import type { Elysia } from "elysia";

export function registerMusicAPI(app: Elysia) {
  app.get("/api/queue", () => songQueue);

  app.get("/api/defaultSong", () => {
    let defaultSong = getDefaultSong();

    if (!defaultSong) {
      defaultSong = [
        {
          title: "Sad Flower",
          author: "Reinizra",
          thumbnail:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB4i7JLl4BtWz4gYzUnsx6WcYDAK74ScNGzQ&s",
          id: "agPF9Eptt1s",
        },
      ];
    }

    return defaultSong;
  });
  return app;
}
