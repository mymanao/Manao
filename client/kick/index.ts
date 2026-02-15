import { KICK } from "@/config.ts";
import { KickIt } from "@manaobot/kickit";
import { logger } from "@helpers/logger.ts";
import { loadKickCommands } from "@/client/kick/services/chat.ts";

export async function startKickBot() {
  const bot = new KickIt({
    prefix: "!",
    auth: {
      clientId: KICK.ID,
      clientSecret: KICK.SECRET,
      accessToken: KICK.ACCESS_TOKEN,
      refreshToken: KICK.REFRESH_TOKEN,
      expiresAt: parseInt(KICK.EXPIRES_AT, 10) || Date.now(),
      scopes: [
        "user:read",
        "channel:read",
        "channel:write",
        "channel:rewards:read",
        "channel:rewards:write",
        "chat:write",
        "streamkey:read",
        "events:subscribe",
        "moderation:ban",
        "moderation:chat_message:manage",
        "kicks:read",
      ],
      port: 3002,
    },
    ngrok: {
      authtoken: Bun.env.NGROK_AUTHTOKEN!,
      domain: Bun.env.NGROK_DOMAIN,
      port: 8080,
    },
  });

  await loadKickCommands(bot);

  bot.start().then(() => {
    logger.info("[Manao] Kick bot is ready");
  });
}
