import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as process from "node:process";
import { authenticateKick } from "@manaobot/kickit/utils";
import * as blessed from "blessed";
import { version } from "@/package.json";

interface ConfigTokens { accessToken: string; refreshToken: string }
interface UserInfo { userID: string; login?: string }

const TWITCH_SCOPES = [
  "user:edit", "user:read:email", "chat:read", "chat:edit",
  "channel:moderate", "moderation:read", "moderator:manage:shoutouts",
  "moderator:manage:announcements", "channel:manage:moderators",
  "channel:manage:broadcast", "channel:read:vips",
  "channel:read:subscriptions", "channel:manage:vips",
  "channel:read:redemptions", "channel:manage:redemptions",
  "moderator:read:followers", "bits:read",
] as const;

const KICK_SCOPES = [
  "user:read", "channel:read", "channel:write",
  "channel:rewards:read", "channel:rewards:write",
  "chat:write", "streamkey:read", "events:subscribe",
  "moderation:ban", "moderation:chat_message:manage", "kicks:read",
];

// ── Screen ──────────────────────────────────────

const screen = blessed.screen({
  smartCSR: true,
  title: `ManaoBot v${version} – Configuration`,
  fullUnicode: true,
  cursor: { artificial: true, shape: "line", blink: true, color: "magenta" },
});

screen.key(["C-c"], () => { screen.destroy(); process.exit(0); });

blessed.box({
  parent: screen,
  top: 0, left: 0, width: "100%", height: 3,
  content: `{center}{bold}⟦◄ ManaoBot v${version} – Configuration ►⟧{/bold}{/center}`,
  tags: true,
  border: { type: "line" },
  style: { border: { fg: "magenta" }, fg: "magenta", bg: "black" },
});

const logBox = blessed.log({
  parent: screen,
  bottom: 0, left: 0, width: "100%", height: "40%",
  label: " {bold}Log{/bold} ",
  tags: true, border: { type: "line" },
  style: { border: { fg: "cyan" }, fg: "white", bg: "black" },
  scrollable: true, alwaysScroll: true,
  scrollbar: { ch: "│", style: { fg: "cyan" } },
  padding: { left: 1, right: 1 },
});

const mainBox = blessed.box({
  parent: screen,
  top: 3, left: 0, width: "100%-24", height: "60%-3",
  label: " {bold}Setup{/bold} ",
  tags: true, border: { type: "line" },
  style: { border: { fg: "magenta" }, fg: "white", bg: "black" },
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  scrollable: true, alwaysScroll: true,
});

// ── Progress tracker ─────────────────────────────

const STEPS = ["Twitch", "Discord", "Kick", "Ngrok", "Save"] as const;
type Step = (typeof STEPS)[number];

const stepStatus = Object.fromEntries(STEPS.map((s) => [s, "pending"])) as Record<Step, string>;

const progressBox = blessed.box({
  parent: screen,
  top: 3, right: 0, width: 22, height: STEPS.length + 2,
  label: " Steps ",
  tags: true, border: { type: "line" },
  style: { border: { fg: "magenta" }, bg: "black" },
  padding: { left: 1 },
});

const STEP_ICONS: Record<string, string> = {
  pending: "{grey-fg}○{/}", active: "{yellow-fg}●{/}",
  done: "{green-fg}✔{/}", skip: "{grey-fg}–{/}",
};
const STEP_LABELS: Record<string, (s: string) => string> = {
  pending: (s) => `{grey-fg}${s}{/}`,
  active: (s) => `{bold}{white-fg}${s}{/}`,
  done: (s) => `{green-fg}${s}{/}`,
  skip: (s) => `{grey-fg}${s}{/}`,
};

function renderProgress() {
  progressBox.setContent(
    STEPS.map((s) => `${STEP_ICONS[stepStatus[s]]}  ${STEP_LABELS[stepStatus[s]](s)}`).join("\n"),
  );
  screen.render();
}

function setStep(step: Step, status: "active" | "done" | "skip") {
  stepStatus[step] = status;
  renderProgress();
}

renderProgress();
screen.render();

// ── Logging ──────────────────────────────────────

const log = (msg: string) => { logBox.log(msg); screen.render(); };
const logInfo    = (msg: string) => log(`{cyan-fg}ℹ  ${msg}{/}`);
const logSuccess = (msg: string) => log(`{green-fg}✔  ${msg}{/}`);
const logWarn    = (msg: string) => log(`{yellow-fg}⚠  ${msg}{/}`);
const logError   = (msg: string) => log(`{red-fg}✖  ${msg}{/}`);

// ── TUI prompts ──────────────────────────────────

function askConfirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    mainBox.setContent(
      `{bold}{magenta-fg}${question}{/}\n\n` +
      `  {green-fg}[Y]{/} Yes     {red-fg}[N]{/} No\n\n` +
      `{grey-fg}(press Y or N){/}`,
    );
    screen.render();
    const handler = (_: unknown, key: { name: string }) => {
      if (key.name === "y") { screen.unkey("keypress", handler); resolve(true); }
      if (key.name === "n") { screen.unkey("keypress", handler); resolve(false); }
    };
    screen.on("keypress", handler);
  });
}

function askInput(prompt: string, secret = false): Promise<string> {
  return new Promise((resolve) => {
    mainBox.setContent(`{bold}{magenta-fg}${prompt}{/}\n`);
    screen.render();
    const input = blessed.textbox({
      parent: mainBox,
      top: 3, left: 0, width: "100%-4", height: 3,
      border: { type: "line" },
      style: {
        border: { fg: "cyan" },
        fg: secret ? "black" : "white", bg: "black",
        focus: { border: { fg: "magenta" } },
      },
      inputOnFocus: true, censor: secret, keys: true, mouse: true,
    });
    input.key(["enter"], () => {
      const value = input.getValue().trim();
      input.destroy();
      screen.render();
      resolve(value);
    });
    input.focus();
    screen.render();
  });
}

async function promptLogin(msg: string): Promise<void> {
  if (!await askConfirm(msg)) {
    logError("Login required. Exiting.");
    screen.destroy();
    process.exit(1);
  }
}

// ── Env helpers ──────────────────────────────────

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
NODE_ENV=development`.trim();
}

function makeReplaceOrAppend(envContent: { value: string }) {
  return (key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    if (regex.test(envContent.value)) {
      envContent.value = envContent.value.replace(regex, line);
    } else {
      if (envContent.value.length && !envContent.value.endsWith("\n")) envContent.value += "\n";
      envContent.value += line + "\n";
    }
  };
}

// ── Token helpers ────────────────────────────────

async function fetchTokens(cliPath: string): Promise<ConfigTokens> {
  const { stderr } = Bun.spawnSync([cliPath, "token", "-u", "-s", TWITCH_SCOPES.join(" ")]);
  const out = stderr.toString();
  const accessMatch = out.match(/User Access Token:\s*(\S+)/);
  const refreshMatch = out.match(/Refresh Token:\s*(\S+)/);
  if (!accessMatch || !refreshMatch) throw new Error("Missing tokens from Twitch CLI output");
  return { accessToken: accessMatch[1], refreshToken: refreshMatch[1] };
}

async function fetchUserInfo(cliPath: string, accessToken: string): Promise<UserInfo> {
  const { stdout } = Bun.spawnSync([cliPath, "token", "-v", accessToken]);
  const out = stdout.toString();
  const idMatch = out.match(/User ID:\s*(\d+)/);
  const loginMatch = out.match(/Login:\s*(\S+)/);
  if (!idMatch) throw new Error("Failed to parse User ID");
  return { userID: idMatch[1], login: loginMatch?.[1] };
}

// ── Platform configurators ───────────────────────

async function configureTwitch(set: (k: string, v: string) => void) {
  setStep("Twitch", "active");
  if (!await askConfirm("Do you want to set up Manao {bold}Twitch{/bold} Bot?")) {
    logInfo("Twitch skipped."); setStep("Twitch", "skip"); return;
  }

  const enabled = await askConfirm("Do you want to enable Manao {bold}Twitch{/bold} Bot?");
  set("USE_TWITCH", enabled ? "true" : "false");
  if (!enabled) logInfo("Twitch will be disabled. Credentials saved for later.");

  logWarn("You need a Twitch Application. See:");
  logInfo("EN → https://manaobot.netlify.app/en/twitch/00-getting-started/");
  logInfo("TH → https://manaobot.netlify.app/th/twitch/00-getting-started/");

  const clientID = (await askInput("Twitch Application Client ID (blank = keep existing):")) || Bun.env.TWITCH_CLIENT_ID || "";
  const clientSecret = (await askInput("Twitch Application Client Secret (blank = keep existing):", true)) || Bun.env.TWITCH_CLIENT_SECRET || "";

  Bun.spawnSync(["twitch", "configure", "-i", clientID, "-s", clientSecret]);

  await promptLogin("Log in to your {bold}BOT{/bold} Twitch account (secondary / bot account). Ready?");
  logInfo("Fetching BOT tokens…");
  const botTokens = await fetchTokens("twitch");
  const botInfo = await fetchUserInfo("twitch", botTokens.accessToken);
  logSuccess(`Bot account detected: ${botInfo.login ?? botInfo.userID}`);

  await promptLogin("Log in to your {bold}BROADCASTER{/bold} Twitch account (your main streaming account). Ready?");
  logInfo("Fetching BROADCASTER tokens…");
  const bcTokens = await fetchTokens("twitch");
  const bcInfo = await fetchUserInfo("twitch", bcTokens.accessToken);
  logSuccess(`Broadcaster account detected: ${bcInfo.login ?? bcInfo.userID}`);

  set("TWITCH_BOT_ACCESS_TOKEN", botTokens.accessToken);
  set("TWITCH_BOT_REFRESH_TOKEN", botTokens.refreshToken);
  set("BROADCASTER_ACCESS_TOKEN", bcTokens.accessToken);
  set("BROADCASTER_REFRESH_TOKEN", bcTokens.refreshToken);
  set("TWITCH_BOT_ID", botInfo.userID);
  set("BROADCASTER_ID", bcInfo.userID);
  set("BROADCASTER_CHANNEL", bcInfo.login ?? "");
  set("TWITCH_CLIENT_ID", clientID);
  set("TWITCH_CLIENT_SECRET", clientSecret);

  logSuccess("Twitch configured.");
  setStep("Twitch", "done");
}

async function configureDiscord(set: (k: string, v: string) => void) {
  setStep("Discord", "active");
  if (!await askConfirm("Do you want to set up Manao {bold}Discord{/bold} Bot?")) {
    logInfo("Discord skipped."); setStep("Discord", "skip"); return;
  }

  const enabled = await askConfirm("Do you want to enable Manao {bold}Discord{/bold} Bot?");
  set("USE_DISCORD", enabled ? "true" : "false");
  if (!enabled) logInfo("Discord will be disabled. Credentials saved for later.");

  logWarn("You need a Discord Bot token. See:");
  logInfo("EN → https://manaobot.netlify.app/en/discord/00-getting-started/");
  logInfo("TH → https://manaobot.netlify.app/th/discord/00-getting-started/");

  const token = await askInput("Discord Bot Token (blank = keep existing):", true);
  if (token) set("DISCORD_BOT_TOKEN", token);

  logSuccess("Discord configured.");
  setStep("Discord", "done");
}

async function configureKick(set: (k: string, v: string) => void) {
  setStep("Kick", "active");
  if (!await askConfirm("Do you want to set up Manao {bold}Kick{/bold} Bot?")) {
    logInfo("Kick skipped."); setStep("Kick", "skip"); return;
  }

  const enabled = await askConfirm("Do you want to enable Manao {bold}Kick{/bold} Bot?");
  set("USE_KICK", enabled ? "true" : "false");
  if (!enabled) logInfo("Kick will be disabled. Credentials saved for later.");

  logWarn("You need a Kick Application. See:");
  logInfo("EN → https://manaobot.netlify.app/en/kick/00-getting-started/");
  logInfo("TH → https://manaobot.netlify.app/th/kick/00-getting-started/");

  const clientId = (await askInput("Kick Client ID (blank = keep existing):")) || Bun.env.KICK_CLIENT_ID || "";
  const clientSecret = (await askInput("Kick Client Secret (blank = keep existing):", true)) || Bun.env.KICK_CLIENT_SECRET || "";

  logInfo("Authenticating with Kick… (browser window may open)");
  const { access_token, refresh_token, expires_at } = await authenticateKick({
    clientId, clientSecret, scopes: KICK_SCOPES, port: 3002,
  });

  set("KICK_CLIENT_ID", clientId);
  set("KICK_CLIENT_SECRET", clientSecret);
  set("KICK_ACCESS_TOKEN", access_token);
  set("KICK_REFRESH_TOKEN", refresh_token);
  set("KICK_EXPIRES_AT", (expires_at ?? Date.now()).toString());

  logSuccess("Kick configured.");
  setStep("Kick", "done");
}

async function configureNgrok(set: (k: string, v: string) => void) {
  setStep("Ngrok", "active");
  if (!await askConfirm("Do you want to set up {bold}Ngrok{/bold}? (required for Kick event webhooks)")) {
    logInfo("Ngrok skipped."); setStep("Ngrok", "skip"); return;
  }

  logWarn("You need an Ngrok Auth Token. See:");
  logInfo("→ https://dashboard.ngrok.com/get-started/your-authtoken");

  const authtoken = await askInput("Ngrok Auth Token (blank = keep existing):");
  const domain = await askInput("Ngrok Domain (blank = keep existing):");
  if (authtoken) set("NGROK_AUTHTOKEN", authtoken);
  if (domain) set("NGROK_DOMAIN", domain);

  logSuccess("Ngrok configured.");
  setStep("Ngrok", "done");
}

// ── Entry point ──────────────────────────────────

async function run(): Promise<void> {
  try {
    const envFile = Bun.file(".env");
    const isFirstTime = !(await envFile.exists());
    logInfo(isFirstTime ? "No existing .env found — creating fresh config." : "Existing .env found — updating values.");

    const envContent = { value: isFirstTime ? generateEnvTemplate() : await envFile.text() };
    const set = makeReplaceOrAppend(envContent);

    await configureTwitch(set);
    await configureDiscord(set);
    await configureKick(set);
    await configureNgrok(set);

    setStep("Save", "active");
    await writeFile(join(process.cwd(), ".env"), envContent.value, "utf8");
    setStep("Save", "done");

    const doneMsg = isFirstTime ? "✔  .env created successfully!  You can close this window." : "✔  .env updated successfully!";
    logSuccess(doneMsg);

    mainBox.setContent(
      "\n\n" +
      `{center}{bold}{green-fg}${doneMsg}{/}{/bold}{/center}\n\n` +
      "{center}{grey-fg}Press any key to exit.{/}{/center}",
    );
    screen.render();
    screen.once("keypress", () => { screen.destroy(); process.exit(0); });
  } catch (err: any) {
    logError(`Configuration failed: ${err.message}`);
    mainBox.setContent(
      "\n\n{center}{bold}{red-fg}✖  Configuration failed!{/}{/bold}{/center}\n\n" +
      `{center}{grey-fg}${err.message}{/}{/center}\n\n` +
      "{center}Press any key to exit.{/center}",
    );
    screen.render();
    screen.once("keypress", () => { screen.destroy(); process.exit(1); });
  }
}

await run();