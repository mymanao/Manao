import { Home } from "@server/app/Home.tsx";
import { ChannelPoints } from "@server/app/manager/ChannelPoints.tsx";
import { CommandManager } from "@server/app/manager/Commands.tsx";
import { CustomReplies } from "@server/app/manager/Replies.tsx";
import { Queue } from "@server/app/Queue.tsx";
import { SoundboardController } from "@server/app/soundboard/Controller.tsx";
import { SoundboardPlayer } from "@server/app/soundboard/Player.tsx";
import { Template } from "@server/app/Template.tsx";
import type { Elysia } from "elysia";

function registerPageRoutes(app: Elysia): Elysia {
  app.get("/", () =>
    Template(Home(), {
      title: "ManaoWeb - Home",
      includeStyles: ["index.css"],
    }),
  );

  app.get("/queue", () =>
    Template(Queue(), {
      title: "ManaoWeb - Music Queue",
      includeStyles: ["queue.css"],
      includeScripts: ["queue.js"],
    }),
  );

  app.get("/soundboard/controller", () =>
    Template(SoundboardController(), {
      title: "ManaoWeb - Soundboard Controller",
      includeScripts: ["soundboard/controller.js"],
    }),
  );

  app.get("/soundboard/player", () =>
    Template(SoundboardPlayer(), {
      title: "ManaoWeb - Soundboard Player",
      includeScripts: ["soundboard/player.js"],
    }),
  );

  app.get("/manager/commands", () =>
    Template(CommandManager(), {
      title: "ManaoWeb - Commands Manager",
      includeScripts: ["manager/commands.js"],
    }),
  );

  app.get("/manager/channel-points", () =>
    Template(ChannelPoints(), {
      title: "ManaoWeb - Channel Points Soundboard",
      includeScripts: ["manager/channelpoints.js"],
    }),
  );

  app.get("/manager/replies", () =>
    Template(CustomReplies(), {
      title: "ManaoWeb - Custom Replies Manager",
      includeScripts: ["manager/replies.js"],
    }),
  );

  return app;
}

export { registerPageRoutes };
