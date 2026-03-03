import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as process from "node:process";
import { confirm, input, password } from "@inquirer/prompts";
import { authenticateKick } from "@manaobot/kickit/utils";
import chalk from "chalk";
import { version } from "@/package.json";

const TWITCH_SCOPES = [
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
] as const;

interface ConfigTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  userID: string;
  login?: string;
}

/* ----------------------------------
   Helpers
---------------------------------- */

async function fetchTokens(cliPath: string): Promise<ConfigTokens> {
  const { stderr } = Bun.spawnSync([
    cliPath,
    "token",
    "-u",
    "-s",
    TWITCH_SCOPES.join(" "),
  ]);

  const accessMatch = stderr.toString().match(/User Access Token:\s*(\S+)/);
  const refreshMatch = stderr.toString().match(/Refresh Token:\s*(\S+)/);

  if (!accessMatch || !refreshMatch) {
    throw new Error("Missing tokens from Twitch CLI output");
  }

  return { accessToken: accessMatch[1], refreshToken: refreshMatch[1] };
}

async function fetchUserInfo(
  cliPath: string,
  accessToken: string,
): Promise<UserInfo> {
  const { stdout } = Bun.spawnSync([cliPath, "token", "-v", accessToken]);
  const idMatch = stdout.toString().match(/User ID:\s*(\d+)/);
  const loginMatch = stdout.toString().match(/Login:\s*(\S+)/);

  if (!idMatch) {
    throw new Error("Failed to parse User ID");
  }

  return { userID: idMatch[1], login: loginMatch?.[1] };
}

async function promptLogin(promptMsg: string): Promise<void> {
  const confirmed = await confirm({ message: promptMsg });
  if (!confirmed) {
    console.log(chalk.bold.red("✖ Login required. Exiting."));
    process.exit(1);
  }
}

function makeReplaceOrAppend(envContent: { value: string }) {
  return (key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;

    if (regex.test(envContent.value)) {
      envContent.value = envContent.value.replace(regex, line);
    } else {
      if (envContent.value.length && !envContent.value.endsWith("\n")) {
        envContent.value += "\n";
      }
      envContent.value += line + "\n";
    }
  };
}

/* ----------------------------------
   First-time Setup (no .env exists)
---------------------------------- */

function generateEnvTemplate(): string {
  return `
# ========================
#       TWITCH BOT
# ========================

USE_TWITCH=false

TWITCH_BOT_ACCESS_TOKEN=
TWITCH_BOT_REFRESH_TOKEN=

BROADCASTER_ACCESS_TOKEN=
BROADCASTER_REFRESH_TOKEN=

TWITCH_BOT_ID=
BROADCASTER_ID=
BROADCASTER_CHANNEL=

TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=


# ========================
#       DISCORD BOT
# ========================

USE_DISCORD=false

DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
SERVER_ID=


# ========================
#         KICK BOT
# ========================

USE_KICK=false

KICK_CLIENT_ID=
KICK_CLIENT_SECRET=

KICK_ACCESS_TOKEN=
KICK_REFRESH_TOKEN=
KICK_EXPIRES_AT=


# ========================
#         NGROK
# ========================

NGROK_AUTHTOKEN=
NGROK_DOMAIN=


# ========================
#        ENVIRONMENT
# ========================

NODE_ENV=development
`.trim();
}

/* ----------------------------------
   Platform config
---------------------------------- */

async function configureTwitch(
  replaceOrAppend: (key: string, value: string) => void,
): Promise<void> {
  const useTwitch = await confirm({
    message: "Do you want to enable Manao Twitch Bot?",
  });

  if (!useTwitch) {
    replaceOrAppend("USE_TWITCH", "false");
    return;
  }

  console.log(
    chalk.yellowBright(
      "⚠ To enable Twitch integration, you need to create a Twitch Application and get its Client ID and Client Secret. Read the guide below:",
    ),
  );
  console.log(
    chalk.cyan(
      "→ English: https://manaobot.netlify.app/en/twitch/00-getting-started/",
    ),
  );
  console.log(
    chalk.cyan(
      "→ Thai: https://manaobot.netlify.app/th/twitch/00-getting-started/",
    ),
  );

  const cliPath = "twitch";

  const clientID =
    (
      await input({
        message:
          "Enter your Twitch Application Client ID (Leave blank for unchanged):",
      })
    ).trim() ||
    Bun.env.TWITCH_CLIENT_ID ||
    "";
  const clientSecret =
    (
      await password({
        message:
          "Enter your Twitch Application Client Secret (Leave blank for unchanged):",
      })
    ).trim() ||
    Bun.env.TWITCH_CLIENT_SECRET ||
    "";

  Bun.spawnSync([cliPath, "configure", "-i", clientID, "-s", clientSecret]);

  await promptLogin(
    "To continue, please login to your BOT Twitch account (the secondary account for the bot).",
  );
  const botTokens = await fetchTokens(cliPath);
  const botInfo = await fetchUserInfo(cliPath, botTokens.accessToken);

  await promptLogin(
    "To continue, please login to your BROADCASTER Twitch account (the primary account for streaming).",
  );
  const bcTokens = await fetchTokens(cliPath);
  const bcInfo = await fetchUserInfo(cliPath, bcTokens.accessToken);

  replaceOrAppend("TWITCH_BOT_ACCESS_TOKEN", botTokens.accessToken);
  replaceOrAppend("TWITCH_BOT_REFRESH_TOKEN", botTokens.refreshToken);
  replaceOrAppend("BROADCASTER_ACCESS_TOKEN", bcTokens.accessToken);
  replaceOrAppend("BROADCASTER_REFRESH_TOKEN", bcTokens.refreshToken);
  replaceOrAppend("TWITCH_BOT_ID", botInfo.userID);
  replaceOrAppend("BROADCASTER_ID", bcInfo.userID);
  replaceOrAppend("BROADCASTER_CHANNEL", bcInfo.login ?? "");
  replaceOrAppend("TWITCH_CLIENT_ID", clientID);
  replaceOrAppend("TWITCH_CLIENT_SECRET", clientSecret);
  replaceOrAppend("USE_TWITCH", "true");
}

async function configureDiscord(
  replaceOrAppend: (key: string, value: string) => void,
): Promise<void> {
  const useDiscord = await confirm({
    message: "Do you want to enable Manao Discord Bot?",
  });

  if (!useDiscord) {
    replaceOrAppend("USE_DISCORD", "false");
    return;
  }

  console.log(
    chalk.yellowBright(
      "⚠ To enable Discord integration, you need to create a Discord Bot and get its token. Read the guide below:",
    ),
  );
  console.log(
    chalk.cyan(
      "→ English: https://manaobot.netlify.app/en/discord/00-getting-started/",
    ),
  );
  console.log(
    chalk.cyan(
      "→ Thai: https://manaobot.netlify.app/th/discord/00-getting-started/",
    ),
  );

  const token = await password({
    message: "Enter your Discord Bot Token (Leave blank for unchanged):",
  });

  replaceOrAppend("USE_DISCORD", "true");
  if (token) replaceOrAppend("DISCORD_BOT_TOKEN", token.trim());
}

async function configureKick(
  replaceOrAppend: (key: string, value: string) => void,
): Promise<void> {
  const useKick = await confirm({
    message: "Do you want to enable Manao Kick Bot?",
  });

  if (!useKick) {
    replaceOrAppend("USE_KICK", "false");
    return;
  }

  console.log(
    chalk.yellowBright(
      "⚠ To enable Kick integration, you need to create a Kick Application and get its Client ID and Client Secret. Read the guide below:",
    ),
  );
  console.log(
    chalk.cyan(
      "→ English: https://manaobot.netlify.app/en/kick/00-getting-started/",
    ),
  );
  console.log(
    chalk.cyan(
      "→ Thai: https://manaobot.netlify.app/th/kick/00-getting-started/",
    ),
  );

  const clientId =
    (
      await input({
        message: "Enter your Kick Client ID (Leave blank for unchanged):",
      })
    ).trim() ||
    Bun.env.KICK_CLIENT_ID ||
    "";
  const clientSecret =
    (
      await password({
        message: "Enter your Kick Client Secret (Leave blank for unchanged):",
      })
    ).trim() ||
    Bun.env.KICK_CLIENT_SECRET ||
    "";

  const { access_token, refresh_token, expires_at } = await authenticateKick({
    clientId,
    clientSecret,
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
  });

  replaceOrAppend("KICK_CLIENT_ID", clientId);
  replaceOrAppend("KICK_CLIENT_SECRET", clientSecret);
  replaceOrAppend("KICK_ACCESS_TOKEN", access_token);
  replaceOrAppend("KICK_REFRESH_TOKEN", refresh_token);
  replaceOrAppend("KICK_EXPIRES_AT", (expires_at ?? Date.now()).toString());
  replaceOrAppend("USE_KICK", "true");
}

async function configureNgrok(
  replaceOrAppend: (key: string, value: string) => void,
): Promise<void> {
  const useNgrok = await confirm({
    message: "Do you want to configure Ngrok? (used for Kick event webhooks)",
  });

  if (!useNgrok) return;

  console.log(
    chalk.yellowBright(
      "⚠ To enable Ngrok, you need an Ngrok account and an Auth Token. Read the guide below:",
    ),
  );
  console.log(
    chalk.cyan("→ https://dashboard.ngrok.com/get-started/your-authtoken"),
  );

  const authtoken = (
    await input({
      message: "Enter your Ngrok Auth Token (Leave blank for unchanged):",
    })
  ).trim();

  const domain = (
    await input({
      message: "Enter your Ngrok Domain (Leave blank for unchanged):",
    })
  ).trim();

  if (authtoken) replaceOrAppend("NGROK_AUTHTOKEN", authtoken);
  if (domain) replaceOrAppend("NGROK_DOMAIN", domain);
}

/* ----------------------------------
   Entry Point
---------------------------------- */

async function run(): Promise<void> {
  try {
    console.log(
      chalk.bold.underline.magenta(
        `⟦◄ ManaoBot v${version} - Configuration ►⟧`,
      ),
    );

    const envFile = Bun.file(".env");
    const isFirstTime = !(await envFile.exists());

    const envContent = {
      value: isFirstTime ? generateEnvTemplate() : await envFile.text(),
    };
    const replaceOrAppend = makeReplaceOrAppend(envContent);

    await configureTwitch(replaceOrAppend);
    await configureDiscord(replaceOrAppend);
    await configureKick(replaceOrAppend);
    await configureNgrok(replaceOrAppend);

    await writeFile(join(process.cwd(), ".env"), envContent.value, "utf8");

    const doneMsg = isFirstTime
      ? "✅ Configuration complete! Your .env file has been created.\nYou can close this window."
      : "✅ Configuration updated successfully!";

    console.log(chalk.green(`\n${doneMsg}`));
    process.exit(0);
  } catch (err: any) {
    console.error(chalk.bold.red("✖ Configuration failed:"), err.message);
    process.exit(1);
  }
}

await run();
