import { addBalance, getNickname, initAccount } from "@helpers/database";
import { logger } from "@helpers/logger";
import type { ApiClient } from "@twurple/api";
import {
  buildEmoteImageUrl,
  type ChatClient,
  type ChatMessage,
  parseEmotePositions,
} from "@twurple/chat";
import { PREFIX } from "@/config";
import { io } from "@/server";
import type { MessageData, UserBadge } from "@/types";
import { handleCommand } from "./commandHandler";

export async function handleMessage(
  channel: string,
  user: string,
  message: string,
  msgObj: ChatMessage,
  userID: string,
  channelID: string,
  chatClient: ChatClient,
  apiClient: ApiClient,
) {
  try {
    if (message.startsWith(PREFIX)) {
      await handleCommand(
        channel,
        user,
        userID,
        channelID,
        message,
        chatClient,
        apiClient,
      );
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
    const nickname = getNickname(userID);
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

    initAccount(userID);
    addBalance(userID, Math.trunc(Math.random() * 4));
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
