import { logger } from "@helpers/logger";
import { setupAuthProvider } from "@twitch/services/auth";
import { initializeChatClient } from "@twitch/services/chat";
import { initializeEventSub } from "@twitch/services/eventsub";

export async function main() {
  try {
    const authProvider = setupAuthProvider();
    const { chatClient, apiClient } = await initializeChatClient(authProvider);

    await initializeEventSub(chatClient, apiClient);

    logger.info("[Manao] Bot successfully initialized");
  } catch (error) {
    throw error;
  }
}
