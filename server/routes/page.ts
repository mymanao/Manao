import { CommandManager } from "@server/app/Commands.tsx";
import { Home } from "@server/app/Home.tsx";
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

  app.get("/commands", () =>
    Template(CommandManager(), {
      title: "ManaoWeb - Commands Manager",
      includeScripts: ["commands.js"],
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

  return app;
}

export { registerPageRoutes };
