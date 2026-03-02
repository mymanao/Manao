import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
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

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let command: string[];

  switch (platform) {
    case "win32":
      command = ["cmd", "/c", "start", ""];
      break;
    case "darwin":
      command = ["open"]
      break;
    default:
      command = ["xdg-open"]
      break;
  }

  Bun.spawnSync([...command, url]);
}

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
    console.log(chalk.bold.red("Login required. Exiting."));
    process.exit(1);
  }
}

async function startConfig(): Promise<void> {
  console.log(
    chalk.bold.underline.magenta(`⟦◄ ManaoBot v${version} - Configuration ►⟧`),
  );

  const lang = {
    en: {
      beforeStart:
        "🛠 Before we start, you need to create a Twitch Application.",
      goTo: "Go to: ",
      createAppInfo1: "Click 'Register Your Application'",
      createAppInfo2: "When creating the app, set the OAuth Redirect URL to: ",
      createAppInfo3:
        "You can leave the category as 'Application Integration' or anything.",
      createAppInfo4: "Set client type to 'Confedential'",
      createAppInfo5:
        "The application name doesn't matter — name it anything you want.",
      openBrowser: "Open browser to continue?",
      confirmCreateApp:
        "Press 'Enter' once you have created the app and have your Client ID and Client Secret ready.",
      enterClientID: "Enter your Twitch Application Client ID:",
      enterClientSecret: "Enter your Twitch Application Client Secret:",
      promptLogin:
        "To continue, please login to your BROADCASTER Twitch account (the primary account for streaming).",
      promptLoginBot:
        "To continue, please login to your BOT Twitch account (the secondary account for the bot).",
      useDiscord: "Would you like to enable Discord integration? (Y/n):",
      enterToken: "Enter your Discord Bot Token:",
      configComplete:
        "✅ Configuration complete! .env file created.\nYou can close this window!",
    },
    th: {
      beforeStart: "🛠 ก่อนที่เราจะเริ่ม คุณต้องสร้าง Twitch Application",
      goTo: "ไปที่: ",
      createAppInfo1: "คลิก 'ลงทะเบียนแอพพลิเคชั่น'",
      createAppInfo2: "เมื่อสร้างแอป ให้ตั้งค่า OAuth Redirect URL เป็น: ",
      createAppInfo3:
        "คุณสามารถปล่อยหมวดหมู่เป็น 'Application Integration' หรืออะไรก็ได้",
      createAppInfo4: "ตั้งค่าประเภทไคลเอนต์เป็น 'โปรดเก็บรักษาเป็นความลับ'",
      createAppInfo5: "ชื่อแอปพลิเคชันไม่สำคัญ — ตั้งชื่ออะไรก็ได้ที่คุณต้องการ",
      openBrowser: "เปิดเบราว์เซอร์เพื่อดำเนินการต่อ?",
      confirmCreateApp:
        "กด 'Enter' เมื่อคุณสร้างแอปและมี Client ID (ID ไคลแอนต์) และ Client Secret (ความลับบนไคลเอนท์) พร้อมแล้ว",
      enterClientID: "ใส่ Client ID ของ Twitch Application ของคุณ:",
      enterClientSecret: "ใส่ Client Secret ของ Twitch Application ของคุณ:",
      promptLogin:
        "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชี Twitch ของคุณที่ใช้ในการสตรีม (บัญชีหลักที่ใช้สตรีม)",
      promptLoginBot:
        "เพื่อดำเนินการต่อ โปรดเข้าสู่ระบบบัญชีบอต Twitch ของคุณ (บัญชีรองที่ใช้สำหรับบอต)",
      useDiscord: "ต้องการเปิดใช้งานบอต Discord ด้วยหรือไม่ (Y/n):",
      enterToken: "ใส่โทเคนของบอต:",
      configComplete:
        "✅ การกำหนดค่าครบถ้วน! สร้างไฟล์ .env เรียบร้อยแล้ว\nสามารถปิดหน้าต่างนี้ได้เลย!",
    },
  };

  let currentlang = "en";

  let cliPath = join(__dirname, "resources", "twitch-cli", "twitch.exe");
  if (!(await Bun.file(cliPath).exists())) cliPath = "twitch.exe"; // Assuming the installer does its job

  // ask language (en/th)
  const langChoice = await select({
    message: "Choose setup language:",
    choices: ["English", "ภาษาไทย"],
  });

  if (langChoice === "English") currentlang = "en";
  if (langChoice === "ภาษาไทย") currentlang = "th";

  console.log(
    chalk.yellowBright(lang[currentlang as keyof typeof lang].beforeStart),
  );
  console.log(
    lang[currentlang as keyof typeof lang].goTo +
      chalk.blueBright("https://dev.twitch.tv/console/apps"),
  );
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo1}`),
  );
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo2}`),
    chalk.bold("http://localhost:3000"),
  );
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo3}`),
  );
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo4}`),
  );
  console.log(
    chalk.gray(`→ ${lang[currentlang as keyof typeof lang].createAppInfo5}`),
  );

  const result = await confirm({
    message: `${lang[currentlang as keyof typeof lang].openBrowser}`,
  });

  if (result) await openBrowser("https://dev.twitch.tv/console/apps");

  await confirm({
    message: `${lang[currentlang as keyof typeof lang].confirmCreateApp}`,
  });

  // Ask for Client ID and Secret
  const clientID = await input({
    message: lang[currentlang as keyof typeof lang].enterClientID,
  });
  const clientSecret = await input({
    message: lang[currentlang as keyof typeof lang].enterClientSecret,
  });

  // Configure Twitch CLI
  Bun.spawnSync([cliPath, "configure", "-i", clientID, "-s", clientSecret]);

  // Bot account
  await promptLogin(
    `\n${lang[currentlang as keyof typeof lang].promptLoginBot}`,
  );
  const botTokens = await fetchTokens(cliPath);
  const botInfo = await fetchUserInfo(cliPath, botTokens.accessToken);

  // Broadcaster account
  await promptLogin(`\n${lang[currentlang as keyof typeof lang].promptLogin}`);
  const bcTokens = await fetchTokens(cliPath);
  const bcInfo = await fetchUserInfo(cliPath, bcTokens.accessToken);

  // Create .env content
  const envContent = `
# ========================
#       TWITCH BOT
# ========================

USE_TWITCH=false

TWITCH_BOT_ACCESS_TOKEN=${botTokens.accessToken}
TWITCH_BOT_REFRESH_TOKEN=${botTokens.refreshToken}

BROADCASTER_ACCESS_TOKEN=${bcTokens.accessToken}
BROADCASTER_REFRESH_TOKEN=${bcTokens.refreshToken}

TWITCH_BOT_ID=${botInfo.userID}
BROADCASTER_ID=${bcInfo.userID}
BROADCASTER_CHANNEL=${bcInfo.login ?? ""}

TWITCH_CLIENT_ID=${clientID}
TWITCH_CLIENT_SECRET=${clientSecret}


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

  await writeFile(join(process.cwd(), ".env"), envContent, "utf8");

  console.log(
    chalk.green(`\n${lang[currentlang as keyof typeof lang].configComplete}`),
  );
}

async function run() {
  try {
    await startConfig();
    process.exit(0);
  } catch (err: any) {
    console.error(chalk.bold.red("Configuration failed:"), err.message);
    process.exit(1);
  }
}

await run();
