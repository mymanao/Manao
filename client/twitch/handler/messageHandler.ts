import { logger } from "@helpers/logger";
import type { ApiClient } from "@twurple/api";
import {
  buildEmoteImageUrl,
  type ChatClient,
  type ChatMessage,
  parseEmotePositions,
} from "@twurple/chat";
import { io } from "@/server";
import type { Command, MessageData, UserBadge } from "@/types";
import { handleCommand } from "./commandHandler";
import { addBalance, getUserConfig, initAccount, getNickname } from "@helpers/database";

const config = await getUserConfig();
const PREFIX = config.prefix.twitch;
const { chatReward } = config;
const cooldowns = new Map<string, number>();

export async function handleMessage(
  channel: string,
  user: string,
  message: string,
  msgObj: ChatMessage,
  userID: string,
  channelID: string,
  chatClient: ChatClient,
  apiClient: ApiClient,
  commands: Map<string, Command>,
) {
  try {
    if (message.startsWith(PREFIX)) {
      await handleCommand(channel, user, userID, channelID, message, chatClient, apiClient, commands);
    } else {
      await handleRegularMessage(message, msgObj, userID, apiClient);
    }
  } catch (error) {
    logger.error(`[Message] Error processing message: ${error}`);
  }
}

async function handleRegularMessage(
  message: string,
  msgObj: ChatMessage,
  userID: string,
  apiClient: ApiClient,
) {
  try {
    const id = initAccount({ userID, platform: "twitch" });

    const now = Date.now();
    const lastReward = cooldowns.get(id) ?? 0;

    if (now - lastReward > chatReward.twitch.cooldown * 1000) {
      if (Math.random() < chatReward.twitch.chance) {
        const amount =
          Math.floor(
            Math.random() * (chatReward.twitch.max - chatReward.twitch.min + 1),
          ) + chatReward.twitch.min;
        addBalance(id, amount);
      }
      cooldowns.set(id, now);
    }

    const nickname = getNickname(id);
    const role = determineUserRole(msgObj.userInfo);

    const processedMessage = await processEmotes(message, msgObj);

    const badgeList = await processUserBadges(
      msgObj.userInfo.badges,
      apiClient,
    );

    const messageData: MessageData = {
      from: nickname
        ? `${msgObj.userInfo.displayName} (${nickname})`
        : msgObj.userInfo.displayName,
      message: processedMessage,
      user: msgObj.userInfo.userId,
      id: msgObj.id,
      role,
      color: msgObj.userInfo.color ?? "#FFFFFF",
      badges: badgeList,
    };

    io.emit("message", messageData);
  } catch (error) {
    logger.error(`[Message] Error processing message: ${error}`);
  }
}

function determineUserRole(userInfo: ChatMessage["userInfo"]): string {
  if (userInfo.isBroadcaster) return "broadcaster";
  if (userInfo.isMod) return "mod";
  if (userInfo.isVip) return "vip";
  if (userInfo.isSubscriber) return "sub";
  return "normal";
}

async function processEmotes(
  message: string,
  msgObj: ChatMessage,
): Promise<string> {
  let processedMessage = message;
  const emoteList = parseEmotePositions(message, msgObj.emoteOffsets);

  for (const emote of emoteList) {
    const emoteUrl = buildEmoteImageUrl(emote.id, { size: "3.0" });
    processedMessage = processedMessage.replaceAll(
      emote.name,
      `<img src="${emoteUrl}" alt="${emote.name}" /> `,
    );
  }

  return processedMessage;
}

async function processUserBadges(
  badges: Map<string, string>,
  apiClient: ApiClient,
): Promise<string[]> {
  try {
    const badgeList: string[] = [];
    const globalBadges = await apiClient.chat.getGlobalBadges();

    const globalBadgeTitles: UserBadge[] = globalBadges.map((badge) => ({
      title: badge.getVersion("1")?.title,
      link: badge.getVersion("1")?.getImageUrl(4),
    }));

    for (const badge of badges.keys()) {
      const badgeTitle = globalBadgeTitles.find(
        (b) => b.title?.toLowerCase().split(" ").join("-") === badge,
      );
      if (badgeTitle?.link) {
        badgeList.push(badgeTitle.link);
      }
    }

    return badgeList;
  } catch (error) {
    logger.error(`[Message] Error processing badges: ${error}`);
    return [];
  }
}
