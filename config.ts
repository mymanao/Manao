export const isProduction = Bun.env.NODE_ENV === "production";

export const PORT = Number(Bun.env.PORT ?? 3000);
export const SOCKET_PORT = Number(Bun.env.SOCKET_PORT ?? 5000);

export const PREFIX = "!";

function getEnvVar(key: string, required = true): string {
  const value = Bun.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

export const DIR = {
  APP: "./server/app",
  PUBLIC: "./server/public",
  COMMANDS: {
    TWITCH: "./server/twitch/commands",
    DISCORD: "./server/discord/commands",
  },
};

export const TWITCH = {
  ENABLED: Bun.env.USE_TWITCH === "true",
  CLIENT_ID: getEnvVar("TWITCH_CLIENT_ID"),
  CLIENT_SECRET: getEnvVar("TWITCH_CLIENT_SECRET"),
  BOT: {
    ID: getEnvVar("TWITCH_BOT_ID"),
    ACCESS_TOKEN: getEnvVar("TWITCH_BOT_ACCESS_TOKEN", false),
    REFRESH_TOKEN: getEnvVar("TWITCH_BOT_REFRESH_TOKEN", false),
  },
  BROADCASTER: {
    ID: getEnvVar("BROADCASTER_ID"),
    CHANNEL: getEnvVar("BROADCASTER_CHANNEL"),
    ACCESS_TOKEN: getEnvVar("BROADCASTER_ACCESS_TOKEN", false),
    REFRESH_TOKEN: getEnvVar("BROADCASTER_REFRESH_TOKEN", false),
  },
  SCOPES: [
    "user:edit",
    "user:read:email",
    "chat:read",
    "chat:edit",
    "channel:moderate",
    "moderation:read",
    "moderator:manage:shoutouts",
    "moderator:manage:announcements",
    "channel:manage:moderators",
    "channel:manage:broadcast",
    "channel:read:vips",
    "channel:read:subscriptions",
    "channel:manage:vips",
    "channel:read:redemptions",
    "channel:manage:redemptions",
    "moderator:read:followers",
    "bits:read",
  ],
};

export const DISCORD = {
  ENABLED: Bun.env.USE_DISCORD === "true",
  BOT_TOKEN: getEnvVar("DISCORD_BOT_TOKEN"),
};
