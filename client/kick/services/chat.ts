import { Glob } from "bun";
import {
  getCurrency,
  getDisabledCommands,
  getLang,
} from "@helpers/preferences";
import { addBalance, getUserConfig, initAccount } from "@helpers/database";
import { getReplyStore } from "@helpers/replyStore";
import { logger } from "@helpers/logger";
import type { Command } from "@/types";
import type { KickIt } from "@manaobot/kickit";
import type { ChatMessageEvent } from "@manaobot/kick/types";

export const commands: Map<string, Command> = new Map();
const config = await getUserConfig();
const PREFIX = config.prefix.kick;
const { chatReward } = config;
const sequenceIndex = new Map<string, number>();

export async function loadKickCommands(bot: KickIt) {
  const disabledCommands = new Set(await getDisabledCommands());

  const modules = new Glob("../commands/**/*.{ts,js}");

  for (const path of modules.scanSync(import.meta.dir)) {
    try {
      const imported = await import(path);
      const command: Command = imported.default;

      if (!command) continue;

      const names = [
        command.name.en,
        command.name.th,
        ...(command.aliases?.en ?? []),
        ...(command.aliases?.th ?? []),
      ]
        .filter(Boolean)
        .map((n) => n.toLowerCase());

      const finalCommand: Command = {
        ...command,
        disabled: disabledCommands.has(command.name.en),
      };

      for (const name of names) {
        commands.set(name, finalCommand);

        bot.command(name, async (ctx) => {
          if (finalCommand.disabled) return;

          if (finalCommand.broadcasterOnly) {
            const isBroadcaster =
              ctx.event.sender.user_id === ctx.event.broadcaster.user_id;
            if (!isBroadcaster) return;
          }

          if (finalCommand.modsOnly) {
            const isMod =
              ctx.event.sender?.identity?.badges?.some(
                (badge: any) => badge.type === "moderator",
              ) || ctx.event.sender.user_id === ctx.event.broadcaster.user_id;
            if (!isMod) return;
          }

          const lang = await getLang() ?? "en";

          const meta = {
            user: ctx.event.sender.username,
            channel: ctx.event.broadcaster.username,
            channelID: ctx.event.broadcaster.user_id.toString(),
            userID: ctx.event.sender.user_id.toString(),
            commands,
            lang,
            currency: await getCurrency(),
          };

          try {
            finalCommand.execute(ctx as any, meta, ctx.event.content, ctx.args);
          } catch (err) {
            logger.error(
              `[Kick Command] Error executing ${finalCommand.name.en}: ${err}`,
            );
          }
        });
      }

      logger.info(`[Kick Commands] Loaded: ${command.name.en}`);
    } catch (error) {
      logger.error(`[Kick Commands] Failed to load ${path}: ${error}`);
    }
  }

  logger.info(`[Kick Commands] Total mappings: ${commands.size}`);

  const cooldowns = new Map<string, number>();

  bot.kickClient.webhooks.on(
    "chat.message.sent",
    async (event: ChatMessageEvent) => {
      if (event.content.startsWith(PREFIX)) return;

      const kickID = event.sender.user_id.toString();
      const id = initAccount({ userID: kickID, platform: "kick" });

      const now = Date.now();
      const lastReward = cooldowns.get(id) ?? 0;

      if (now - lastReward > chatReward.kick.cooldown * 1000) {
        if (Math.random() < chatReward.kick.chance) {
          const amount =
            Math.floor(
              Math.random() * (chatReward.kick.max - chatReward.kick.min + 1),
            ) + chatReward.kick.min;
          addBalance(id, amount);
        }
        cooldowns.set(id, now);
      }

      const message = event.content.toLowerCase();

      for (const reply of getReplyStore()) {
        for (const keyword of reply.keywords) {
          const lowerKey = keyword.toLowerCase();

          const matched =
            reply.keywordType === "equals"
              ? message === lowerKey
              : message.includes(lowerKey);

          if (!matched) continue;

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
            await bot.kickClient.chat.send({ content: response });
          } catch (err) {
            logger.error(`[Kick] Failed to send custom reply: ${err}`);
          }

          return;
        }
      }
    },
  );
}
