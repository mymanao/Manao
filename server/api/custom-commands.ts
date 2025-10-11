import { findCommand } from "@helpers/command";
import { addCommand, deleteCommand } from "@helpers/database";
import { customCommands } from "@twitch/services/chat";
import type { Elysia } from "elysia";
import type { Command } from "@/types";

export function registerCustomCommandAPI(app: Elysia) {
  app.get("/api/custom-commands", () => {
    const commandList = [];
    for (const command of customCommands.values()) {
      commandList.push({
        name: command.name,
        description: command.description,
        aliases: command.aliases,
        args: [],
        disabled: command.disabled ?? false,
        execute: command.execute,
      });
    }
    return commandList;
  });

  app.post("/api/custom-commands", ({ body }) => {
    const newCommand = body as Command;
    if (findCommand(customCommands, newCommand.name.en)) {
      return { error: "Command already exists" };
    }

    try {
      addCommand(newCommand);
    } catch (error) {
      console.error("Error adding command:", error);
      return { error: "Failed to add command" };
    }

    return {
      success: true,
    };
  });

  app.put(
    "/api/custom-commands/:commandName",
    ({ params: { commandName }, body }) => {
      const command = findCommand(customCommands, commandName);
      if (!command) {
        return { error: "Command not found" };
      }

      const updatedCommand = body as Command;

      command.name = updatedCommand.name;
      command.description = updatedCommand.description;
      command.aliases = updatedCommand.aliases;
      command.args = updatedCommand.args;
      command.modsOnly = updatedCommand.modsOnly;
      command.broadcasterOnly = updatedCommand.broadcasterOnly;
      command.execute = updatedCommand.execute;

      addCommand(command);

      return { success: true, command };
    },
  );

  app.delete(
    "/api/custom-commands/:commandName",
    ({ params: { commandName } }) => {
      const command = findCommand(customCommands, commandName);
      if (!command) {
        return { error: "Command not found" };
      }

      customCommands.delete(command.name.en);
      deleteCommand(JSON.stringify(command.name));
      return { success: true };
    },
  );
}
