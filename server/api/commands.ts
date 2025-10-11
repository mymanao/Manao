import {
  getLang,
  localizeCommandArgs,
  toggleCommand,
} from "@helpers/preferences";
import { commands } from "@twitch/services/chat";
import type { Elysia } from "elysia";

export function registerCommandsAPI(app: Elysia) {
  app.get("/api/lang", () => {
    return { lang: getLang() };
  });

  app.get("/api/commands", () => {
    const lang = getLang();
    // don't show duplicate commands (aliases)
    const uniqueCommands = Array.from(commands.values()).filter(
      (command, index, self) =>
        index === self.findIndex((c) => c.name.en === command.name.en),
    );
    return uniqueCommands.map((command) => ({
      name: command.name[lang],
      description: command.description[lang],
      alias: command.aliases?.[lang] || [],
      disabled: command.disabled ?? false,
      args: localizeCommandArgs(command.args ?? [], lang),
      modsOnly: command.modsOnly ?? false,
      broadcasterOnly: command.broadcasterOnly ?? false,
    }));
  });

  app.get("/api/commands/:commandName", ({ params: { commandName } }) => {
    let cmdName = decodeURIComponent(commandName);

    const foundCommand = Array.from(commands.values()).find(
      (command) =>
        command.name.th === cmdName ||
        (command.aliases?.th || []).includes(cmdName) ||
        (command.aliases?.en || []).includes(cmdName),
    );

    if (foundCommand) {
      cmdName = foundCommand.name.en;
    }

    const command = commands.get(cmdName);
    if (!command) {
      return { error: "Command not found" };
    }

    const lang = getLang();
    return {
      name: command.name[lang],
      description: command.description[lang],
      alias: command.aliases?.[lang] || [],
      args: localizeCommandArgs(command.args ?? [], lang),
      disabled: command.disabled ?? false,
      modsOnly: command.modsOnly ?? false,
      broadcasterOnly: command.broadcasterOnly ?? false,
    };
  });

  app.post(
    "/api/commands/:commandName/toggle",
    ({ params: { commandName } }) => {
      const command = commands.get(commandName);
      if (!command) {
        return { error: "Command not found" };
      }

      command.disabled = !command.disabled;
      toggleCommand(command.name.en);

      return { success: true, enabled: !command.disabled };
    },
  );

  return app;
}
