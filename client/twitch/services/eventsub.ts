import { logger } from "@helpers/logger.ts";
import {
  getCustomMessages,
  getLang,
  parseTemplate,
} from "@helpers/preferences.ts";
import type { ApiClient } from "@twurple/api";
import type { ChatClient } from "@twurple/chat";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { TWITCH } from "@/config.ts";
import { io } from "@/server";
import type { FeedEvent } from "@/types";

export async function initializeEventSub(
  chatClient: ChatClient,
  apiClient: ApiClient,
) {
  const listener = new EventSubWsListener({ apiClient });
  await setupFollowListener(listener, chatClient);
  await setupSubscriptionListener(listener, chatClient);
  await setupRaidListener(listener, chatClient);
  listener.start();
  logger.info("[EventSub] Listener started");
}

async function setupFollowListener(
  listener: EventSubWsListener,
  chatClient: ChatClient,
) {
  listener.onChannelFollow(TWITCH.BROADCASTER.ID, TWITCH.BOT.ID, (data) => {
    const messageOnFollow = getCustomMessages().onFollow;
    chatClient.say(
      TWITCH.BROADCASTER.CHANNEL,
      parseTemplate(messageOnFollow[getLang()], { user: data.userName }),
    );
    logger.info(`[EventSub] New follower: ${data.userName}`);
    io.emit("feed", {
      type: "success",
      icon: "💟",
      message: `${data.userDisplayName}`,
      action: "Followed",
    } as FeedEvent);
  });
  logger.info("[EventSub] Registered follower listener");
}

async function setupSubscriptionListener(
  listener: EventSubWsListener,
  chatClient: ChatClient,
) {
  listener.onChannelSubscription(TWITCH.BROADCASTER.ID, (data) => {
    const messageOnSubscribe = getCustomMessages().onSubscribe;
    chatClient.say(
      TWITCH.BROADCASTER.CHANNEL,
      parseTemplate(messageOnSubscribe[getLang()], {
        user: data.userName,
        tier: Number(data.tier) / 1000,
      }),
    );
    logger.info(`[EventSub] New subscriber: ${data.userName}`);
    io.emit("feed", {
      type: "success",
      icon: "💟",
      message: `${data.userDisplayName}`,
      action: "Subscribed",
    } as FeedEvent);
  });
  logger.info("[EventSub] Registered subscription listener");
}

async function setupRaidListener(
  listener: EventSubWsListener,
  chatClient: ChatClient,
) {
  listener.onChannelRaidTo(TWITCH.BROADCASTER.ID, (data) => {
    const messageOnRaid = getCustomMessages().onRaid;
    chatClient.say(
      TWITCH.BROADCASTER.CHANNEL,
      parseTemplate(messageOnRaid[getLang()], {
        user: data.raidingBroadcasterDisplayName,
        viewers: data.viewers.toString(),
      }),
    );
    logger.info(
      `[EventSub] New raid from ${data.raidingBroadcasterDisplayName} with ${data.viewers} viewers`,
    );
    io.emit("feed", {
      type: "success",
      icon: "🚀",
      message: `${data.raidingBroadcasterDisplayName} (${data.viewers} viewers)`,
      action: "Raided",
    } as FeedEvent);
  });
  logger.info("[EventSub] Registered raid listener");
}
