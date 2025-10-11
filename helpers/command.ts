import type { Command } from "@/types";

/**
 * Finds a command by checking name and aliases in both languages
 * @param {Map<string, Command>} commandMap The command collection to search
 * @param {string} searchTerm The command name/alias to find
 * @returns {Command|null} Found command object or null
 */
export function findCommand(
  commandMap: Map<string, Command>,
  searchTerm: string,
): Command | null {
  for (const command of commandMap.values()) {
    if (command.name.en === searchTerm || command.name.th === searchTerm) {
      return command;
    }

    const enAliases = command.aliases?.en || [];
    const thAliases = command.aliases?.th || [];

    if (enAliases.includes(searchTerm) || thAliases.includes(searchTerm)) {
      return command;
    }
  }
  return null;
}
