import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fetchCommand } from "@helpers/database";
import { logger } from "@helpers/logger";
import { getCustomReplies, getDisabledCommands } from "@helpers/preferences";
import { handleMessage } from "@twitch/handler/messageHandler";
import { ApiClient } from "@twurple/api";
import type { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { TWITCH } from "@/config.ts";
import type { Command, SongRequestData } from "@/types";

export const commands: Map<string, Command> = new Map();
export const customCommands: Map<string, Command> = fetchCommand();
export const songQueue: SongRequestData[] = [];

let customReplies = getCustomReplies();
const sequenceIndex = new Map<string, number>();

setInterval(() => {
  customReplies = getCustomReplies();
}, 10_000);

export async function loadCommands() {
  const commandsDir = join(import.meta.dir, "../commands");
  const disabledCommands = new Set(getDisabledCommands());

  function getFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        files.push(...getFiles(path));
      } else if (entry.endsWith(".ts") || entry.endsWith(".js")) {
        files.push(path);
      }
    }
    return files;
  }

  for (const file of getFiles(commandsDir)) {
    try {
      const imported = await import(file);
      const command: Command = imported.default;

      const names = [
        command.name.en,
        command.name.th,
        ...(command.aliases?.en ?? []),
        ...(command.aliases?.th ?? []),
      ]
        .filter(Boolean)
        .map((n) => n.toLowerCase());

      names.map((name) => commands.set(name, command));

      if (disabledCommands.has(command.name.en)) command.disabled = true;

      logger.info(`[Commands] Loaded: ${command.name.en}`);
    } catch (error) {
      logger.error(`[Commands] Failed to load ${file}: ${error}`);
    }
  }

  logger.info(`[Commands] Total command mappings: ${commands.size}`);
}

export async function initializeChatClient(
  authProvider: RefreshingAuthProvider,
) {
  await loadCommands();

  const apiClient = new ApiClient({ authProvider });
  const channel = TWITCH.BROADCASTER.CHANNEL;
  if (!channel)
    throw new Error("BROADCASTER_CHANNEL environment variable not set");

  const chatClient = new ChatClient({ authProvider, channels: [channel] });

  chatClient.onConnect(() => {
    logger.info(`[Chat] Connected to Twitch chat on ${channel}`);
  });

  chatClient.onMessage(async (channelName, user, message, msgObj) => {
    const userID = msgObj.userInfo?.userId;
    const channelID = msgObj.channelId;

    if (!userID || !channelID) {
      logger.warn("[Chat] Received message with missing IDs, skipping.");
      return;
    }

    try {
      await handleMessage(
        channelName,
        user,
        message,
        msgObj,
        userID,
        channelID,
        chatClient,
        apiClient,
      );

      const lowerMsg = message.toLowerCase();

      for (const reply of customReplies) {
        for (const keyword of reply.keywords) {
          const lowerKey = keyword.toLowerCase();
          const matched =
            reply.keywordType === "equals"
              ? lowerMsg === lowerKey
              : lowerMsg.includes(lowerKey);

          if (matched) {
            let response = "";

            if (reply.responseType === "random") {
              const randomIndex = Math.floor(
                Math.random() * reply.responses.length,
              );
              response = reply.responses[randomIndex] ?? "";
            } else {
              const key = reply.keywords.join(",");
              const idx = sequenceIndex.get(key) ?? 0;
              response = reply.responses[idx] ?? "";
              sequenceIndex.set(key, (idx + 1) % reply.responses.length);
            }

            try {
              await chatClient.say(channelName, response);
              logger.info(`[Chat] Custom replies sent to ${user}`);
            } catch (err) {
              logger.error(`[Chat] Failed to send custom reply: ${err}`);
            }

            return;
          }
        }
      }
    } catch (error) {
      logger.error(`[Chat] Error handling message from ${user}: ${error}`);
    }
  });

  chatClient.connect();
  return { chatClient, apiClient };
}
