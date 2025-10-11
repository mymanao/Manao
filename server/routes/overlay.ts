import { getDefaultSong } from "@helpers/preferences.ts";
import { Chat } from "@server/app/overlay/Chat.tsx";
import { Feed } from "@server/app/overlay/Feed.tsx";
import { Music } from "@server/app/overlay/Music.tsx";
import { Template } from "@server/app/Template.tsx";
import type { Elysia } from "elysia";

function registerOverlayRoutes(app: Elysia): Elysia {
  const [defaultSong] = getDefaultSong();

  app.get("/overlay/chat", () =>
    Template(Chat(), {
      title: "ManaoWeb - Chat Overlay",
      excludeTailwind: true,
      excludeTemplate: true,
      includeStyles: ["chat.css"],
      includeScripts: ["chat.js"],
    }),
  );

  app.get("/overlay/feed", () =>
    Template(Feed(), {
      title: "ManaoWeb - Event Feed",
      excludeTailwind: true,
      excludeTemplate: true,
      includeStyles: ["feed.css"],
      includeScripts: ["feed.js"],
    }),
  );

  app.get("/overlay/music", () =>
    Template(
      Music({
        songTitle: defaultSong?.title,
        songThumbnail: defaultSong?.thumbnail,
        songAuthor: defaultSong?.author,
      }),
      {
        title: "ManaoWeb - Music Overlay",
        excludeTailwind: false,
        excludeTemplate: true,
        includeStyles: ["music.css"],
        includeScripts: ["https://www.youtube.com/iframe_api", "music.js"],
      },
    ),
  );

  return app;
}

export { registerOverlayRoutes };
