import {confirm, input, password} from '@inquirer/prompts';
import {authenticateKick} from "@manaobot/kickit/utils"
import chalk from "chalk";
import {version} from "@/package.json";
import * as process from "node:process";

console.log(
  chalk.bold.underline.magenta(`⟦◄ ManaoBot v${version} - Configuration ►⟧`),
);

const useDiscord = await confirm({
  message: "Do you want to enable Manao Discord Bot?"
})

const file = Bun.file(".env");
let envContent = (await file.exists()) ? await file.text() : "";

const replaceOrAppend = (key: string, value: string) => {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, line);
  } else {
    if (envContent.length && !envContent.endsWith("\n")) {
      envContent += "\n";
    }
    envContent += line + "\n";
  }
};

if (useDiscord) {
  console.log(chalk.yellowBright("⚠ To enable Discord integration, you need to create a Discord Bot and get its token. Read the guide below:"));
  console.log(chalk.cyan("→ English: https://manaobot.netlify.app/en/discord/00-getting-started/"));
  console.log(chalk.cyan("→ Thai: https://manaobot.netlify.app/th/discord/00-getting-started/"));

  const token = await password({
    message: "Enter your Discord Bot Token (Leave blank for unchanged)",
  });
  replaceOrAppend("USE_DISCORD", "true")
  if (token) {
    replaceOrAppend("DISCORD_BOT_TOKEN", token.trim());
  }
} else {
  replaceOrAppend("USE_DISCORD", "false");
}

const useKick = await confirm({
  message: "Do you want to enable Manao Kick Bot?"
})

if (useKick) {
  console.log(chalk.yellowBright("⚠ To enable Kick integration, you need to create a Kick Application and get its Client ID and Client Secret. Read the guide below:"));
  console.log(chalk.cyan("→ English: https://manaobot.netlify.app/en/kick/00-getting-started/"));
  console.log(chalk.cyan("→ Thai: https://manaobot.netlify.app/th/kick/00-getting-started/"));
  const clientId = (await input({
    message: "Enter your Kick Client ID (Leave blank for unchanged)",
  })).trim() || Bun.env.KICK_CLIENT_ID || "";
  const clientSecret = (await password({
    message: "Enter your Kick Client Secret (Leave blank for unchanged)",
  })).trim() || Bun.env.KICK_CLIENT_SECRET || "";

  const {access_token, refresh_token, expires_at} = await authenticateKick({
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


} else {
  replaceOrAppend("USE_KICK", "false");
}

await Bun.write(file, envContent)

console.log("[Manao] Configuration updated successfully!");
process.exit(0);