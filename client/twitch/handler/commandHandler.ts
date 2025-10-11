import { findCommand } from "@helpers/command";
import {
  addBalance,
  getBalance,
  setBalance,
  subtractBalance,
} from "@helpers/database";
import { t } from "@helpers/i18n";
import { closest } from "@helpers/levenshtein";
import { logger } from "@helpers/logger";
import { getCurrency, getLang } from "@helpers/preferences";
import { commands, customCommands } from "@twitch/services/chat";
import type { ApiClient } from "@twurple/api";
import type { ChatClient } from "@twurple/chat";
import { io } from "@/server";

export async function handleCommand(
  channel: string,
  user: string,
  userID: string,
  channelID: string,
  message: string,
  chatClient: ChatClient,
  apiClient: ApiClient,
) {
  const lang = getLang() ?? "en";
  const say = (msg: string) => chatClient.say(channel, `@${user}, ${msg}`);

  try {
    const parts = message.split(" ");
    const commandName = (parts[0] ?? "").slice(1);
    const args = parts.slice(1);

    const command =
      findCommand(commands, commandName) ??
      findCommand(customCommands, commandName);

    if (!command) {
      const allNames = [
        ...commands.values(),
        ...customCommands.values(),
      ].flatMap((c) => [c.name.en, c.name.th]);

      const suggestion = closest(commandName, allNames);

      if (suggestion) {
        await say(
          t("command.errorCommandNotFound", lang, commandName, suggestion),
        );
      }
      return;
    }

    if (command.disabled) return;

    if (command.broadcasterOnly && userID !== channelID) {
      await say(t("command.errorBroadcasterOnly", lang));
      return;
    }

    if (command.modsOnly) {
      const isMod = await apiClient.moderation.checkUserMod(channelID, userID);
      if (!isMod && userID !== channelID) {
        await say(t("command.errorModeratorOnly", lang));
        return;
      }
    }

    if (command.args) {
      const missing = command.args.filter((arg, i) => arg.required && !args[i]);
      if (missing.length > 0) {
        await say(
          t(
            "command.errorArgsRequired",
            lang,
            missing.map((arg) => arg.name[lang]).join(", "),
          ),
        );
        return;
      }
    }

    const isCustom = !findCommand(commands, commandName);

    if (isCustom) {
      const context = {
        client: { chat: chatClient, io, api: apiClient },
        meta: {
          channel,
          channelID,
          user,
          userID,
          commands,
          lang,
          currency: getCurrency() ?? "KEEB",
        },
        message,
        args,
        say: (msg: string) => chatClient.say(channel, msg),
        getInput: (index: number | null) =>
          index ? args[index - 1] : args.join(" "),
        getBalance,
        addBalance,
        subtractBalance,
        setBalance,
        language: lang,
      };

      const executeCommand = new Function(
        "context",
        `const { client, meta, message, args, say, getInput, getBalance, addBalance, subtractBalance, setBalance, language } = context; ${String(command.execute)}`,
      );

      await executeCommand(context);
      logger.info(`[Custom Command] Executed: ${commandName} by ${user}`);
    } else {
      command.execute(
        { chat: chatClient, io, api: apiClient },
        {
          channel,
          channelID,
          user,
          userID,
          commands,
          lang,
          currency: getCurrency() ?? "COIN",
        },
        message,
        args,
      );
      logger.info(`[Command] Executed: ${commandName} by ${user}`);
    }
  } catch (error) {
    await say(t("command.errorCommandHandler", lang));
    logger.error(`[Command] Error executing ${message}: ${error}`);
  }
}
