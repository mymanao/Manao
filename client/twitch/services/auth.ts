import { logger } from "@helpers/logger";
import { type AccessToken, RefreshingAuthProvider } from "@twurple/auth";
import { TWITCH } from "@/config";
import type { UserType } from "@/types";

function buildUserTokens(user: UserType): AccessToken {
  const tokens = user === "bot" ? TWITCH.BOT : TWITCH.BROADCASTER;

  if (!tokens.ID) {
    throw new Error(`Missing ${user} ID in config`);
  }

  if (!tokens.ACCESS_TOKEN || !tokens.REFRESH_TOKEN) {
    throw new Error(`Missing ${user} Twitch tokens`);
  }

  return {
    accessToken: tokens.ACCESS_TOKEN,
    refreshToken: tokens.REFRESH_TOKEN,
    scope: TWITCH.SCOPES,
    expiresIn: 0,
    obtainmentTimestamp: Date.now(),
  };
}

export function setupAuthProvider(): RefreshingAuthProvider {
  if (!TWITCH.CLIENT_ID || !TWITCH.CLIENT_SECRET) {
    throw new Error("Missing Twitch client ID or secret");
  }

  const authProvider = new RefreshingAuthProvider({
    clientId: TWITCH.CLIENT_ID,
    clientSecret: TWITCH.CLIENT_SECRET,
  });

  authProvider.onRefresh(async (userID, newTokenData) => {
    const userType: UserType = userID === TWITCH.BOT.ID ? "bot" : "broadcaster";

    const target = userType === "bot" ? TWITCH.BOT : TWITCH.BROADCASTER;
    target.ACCESS_TOKEN = newTokenData.accessToken;
    target.REFRESH_TOKEN = newTokenData.refreshToken ?? "";

    logger.info(`[Auth] Refreshed ${userType} token`);
  });

  authProvider.addUser(TWITCH.BOT.ID as string, buildUserTokens("bot"), [
    "chat",
  ]);

  if (TWITCH.BROADCASTER.ACCESS_TOKEN && TWITCH.BROADCASTER.REFRESH_TOKEN) {
    authProvider.addUser(
      TWITCH.BROADCASTER.ID as string,
      buildUserTokens("broadcaster"),
    );
  }

  logger.info("[Auth] Authentication provider configured");
  return authProvider;
}
