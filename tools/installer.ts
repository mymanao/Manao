#!/usr/bin/env bun
import { join, basename } from "node:path";
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from "node:fs";
import * as process from "node:process";

// ── Platform ─────────────────────────────────────

const IS_WINDOWS = process.platform === "win32";
const IS_MAC     = process.platform === "darwin";
const HOME       = process.env.HOME ?? process.env.USERPROFILE ?? "";
const LOCAL_APP  = process.env.LOCALAPPDATA ?? join(HOME, ".local", "share");

const DEFAULT_INSTALL_DIR = IS_WINDOWS
  ? join(LOCAL_APP, "ManaoBot")
  : join(HOME, "ManaoBot");

// ── ANSI colours (skipped on Windows cmd, works in WT/pwsh) ──

const c = {
  reset:   "\x1b[0m",
  red:     "\x1b[31m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  cyan:    "\x1b[36m",
  bold:    "\x1b[1m",
};

const print = {
  info:    (m: string) => console.log(`${c.cyan}${m}${c.reset}`),
  success: (m: string) => console.log(`${c.green}✔  ${m}${c.reset}`),
  warn:    (m: string) => console.log(`${c.yellow}⚠  ${m}${c.reset}`),
  error:   (m: string) => console.error(`${c.red}✖  ${m}${c.reset}`),
  header:  (m: string) => console.log(`${c.bold}${c.cyan}${m}${c.reset}`),
  line:    ()          => console.log(`${c.cyan}${"═".repeat(44)}${c.reset}`),
};

// ── Prompt helpers ───────────────────────────────

function readLine(question: string): string {
  process.stdout.write(question + " ");
  const proc = Bun.spawnSync(
    IS_WINDOWS ? ["cmd", "/c", "set /p x= && echo %x%"] : ["sh", "-c", "IFS= read -r line && printf '%s' \"$line\""],
    { stdin: "inherit", stdout: "pipe", stderr: "inherit" },
  );
  return proc.stdout.toString().trimEnd();
}

function ask(question: string, defaultVal = ""): string {
  const hint = defaultVal ? ` [${defaultVal}]` : "";
  const answer = readLine(`${c.cyan}?${c.reset} ${question}${hint}:`);
  return answer.trim() || defaultVal;
}

function confirm(question: string, defaultYes = true): boolean {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = readLine(`${c.cyan}?${c.reset} ${question} (${hint}):`).toLowerCase();
  if (!answer) return defaultYes;
  return answer === "y" || answer === "yes";
}

function pickFromList<T extends { label: string }>(items: T[], label: string, defaultIndex = 0): T {
  console.log(`\n${c.yellow}${label}${c.reset}`);
  items.forEach((item, i) => {
    const marker = i === 0 ? `${c.green} (latest)${c.reset}` : "";
    console.log(`  ${c.bold}[${i + 1}]${c.reset} ${item.label}${marker}`);
  });
  console.log();
  const raw = ask(`Select (1–${items.length})`, String(defaultIndex + 1));
  const idx = parseInt(raw, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= items.length) {
    print.warn("Invalid selection, defaulting to latest.");
    return items[defaultIndex] as T;
  }
  return items[idx] as T;
}

// ── GitHub releases ──────────────────────────────

interface Release { tag_name: string; published_at: string }

async function fetchReleases(): Promise<Release[]> {
  print.info("Fetching available versions from GitHub…");
  const res = await fetch("https://api.github.com/repos/tinarskii/manao/releases");
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const releases: Release[] = await res.json();
  if (!releases.length) throw new Error("No releases found.");
  return releases.slice(0, 10);
}

// ── Install-path resolution ──────────────────────

function resolveInstallPath(selected: string): string {
  const expanded = selected.replace(/^~/, HOME);
  const name = basename(expanded).toLowerCase();
  return name.endsWith("manaobot") ? expanded : join(expanded, "ManaoBot");
}

async function pickInstallDir(): Promise<string> {
  const options = [
    { label: `Current directory  (${process.cwd()})`, path: process.cwd() },
    { label: `Home folder        (${join(HOME, "ManaoBot")})`, path: join(HOME, "ManaoBot") },
    { label: `Default app dir    (${DEFAULT_INSTALL_DIR})`, path: DEFAULT_INSTALL_DIR },
    { label: "Custom path…", path: "" },
  ];

  if (!IS_WINDOWS && !IS_MAC) {
    options.splice(2, 0, { label: "/opt/ManaoBot  (may need sudo)", path: "/opt/ManaoBot" });
  }

  const picked = pickFromList(options, "Installation folder:", 2);

  if (picked.path) return resolveInstallPath(picked.path);

  const custom = ask("Enter custom path");
  if (!custom) { print.warn("No path entered. Using default."); return DEFAULT_INSTALL_DIR; }
  return resolveInstallPath(custom);
}

// ── Backup / restore ─────────────────────────────

const BACKUP_GLOBS = [".env", ".env.local", "bot-data.sqlite", "config.json", "settings.json"];

function backup(installPath: string): string {
  const tmpDir = join(IS_WINDOWS ? (process.env.TEMP ?? "C:\\Temp") : "/tmp", `manao-backup-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  for (const name of BACKUP_GLOBS) {
    const src = join(installPath, name);
    if (existsSync(src)) {
      cpSync(src, join(tmpDir, name));
      print.info(`  Backed up ${name}`);
    }
  }
  // Also back up any .env* variants
  try {
    for (const f of readdirSync(installPath)) {
      if (f.startsWith(".env") && !BACKUP_GLOBS.includes(f)) {
        cpSync(join(installPath, f), join(tmpDir, f));
        print.info(`  Backed up ${f}`);
      }
    }
  } catch { /* ignore */ }
  return tmpDir;
}

function restore(tmpDir: string, installPath: string) {
  for (const f of readdirSync(tmpDir)) {
    cpSync(join(tmpDir, f), join(installPath, f));
    print.info(`  Restored ${f}`);
  }
  rmSync(tmpDir, { recursive: true, force: true });
}

// ── Dependency checks ────────────────────────────

const hasCommand = (cmd: string) =>
  Bun.spawnSync([cmd, "--version"], { stdout: "pipe", stderr: "pipe" }).exitCode === 0;

const run = (cmd: string[]) =>
  Bun.spawnSync(cmd, { stdin: "inherit", stdout: "inherit", stderr: "inherit" }).exitCode === 0;

async function ensureDependency(name: string, cmd: string, installer: () => void | Promise<void>) {
  if (hasCommand(cmd)) {
    print.success(`${name} found.`);
    return;
  }
  print.warn(`${name} not found. Installing…`);
  await installer();
}

async function ensureGit() {
  await ensureDependency("Git", "git", () => {
    if (IS_WINDOWS) {
      run(["winget", "install", "-e", "--id", "Git.Git",
        "--accept-package-agreements", "--accept-source-agreements", "--silent"]);
    } else if (IS_MAC) {
      run(["brew", "install", "git"]);
    } else {
      print.error("Please install Git manually: sudo apt install git  OR  sudo yum install git");
      process.exit(1);
    }
  });
}

async function ensureBun() {
  process.env.PATH = `${join(HOME, ".bun", "bin")}${IS_WINDOWS ? ";" : ":"}${process.env.PATH}`;
  await ensureDependency("Bun", "bun", async () => {
    if (IS_WINDOWS) {
      const script = join(process.env.TEMP ?? "C:\\Temp", "install-bun.ps1");
      await Bun.write(script, await (await fetch("https://bun.sh/install.ps1")).text());
      run(["powershell", "-ExecutionPolicy", "Bypass", "-File", script]);
      Bun.spawnSync(["del", script]);
    } else {
      run(["sh", "-c", "curl -fsSL https://bun.sh/install | bash"]);
    }
  });
}

async function ensureTwitchCLI() {
  await ensureDependency("Twitch CLI", "twitch", () => {
    if (IS_WINDOWS) {
      run(["winget", "install", "-e", "--id", "Twitch.TwitchCLI",
        "--accept-package-agreements", "--accept-source-agreements", "--silent"]);
    } else {
      print.warn("Please install Twitch CLI manually: https://github.com/twitchdev/twitch-cli");
    }
  });
}

// ── Git clone / update ───────────────────────────

function gitClone(version: string, dest: string) {
  const repo = "https://github.com/tinarskii/manao.git";
  const branch = version === "latest" ? [] : ["--branch", version];

  if (run(["git", "clone", ...branch, repo, dest])) return;

  if (branch.length) {
    print.warn("Branch clone failed, trying manual checkout…");
    run(["git", "clone", repo, dest]);
    process.chdir(dest);
    run(["git", "checkout", version]);
  } else {
    print.error("Failed to clone repository.");
    process.exit(1);
  }
}

function gitUpdate(version: string, dest: string) {
  process.chdir(dest);
  run(["git", "fetch", "--tags", "origin"]);
  run(["git", "checkout", version]);
  run(["git", "pull", "origin", version]);
}

// ── Version helpers ──────────────────────────────

function getInstalledVersion(installPath: string): string {
  try {
    const pkg = JSON.parse(Bun.file(join(installPath, "package.json")).toString());
    return pkg.version ?? "unknown";
  } catch { return "unknown"; }
}

// ── Mode detection ───────────────────────────────

type Mode = "install" | "update" | "uninstall";

function detectMode(argv: string[]): { mode: Mode; manaoPaths: string[] } {
  const flagIndex = argv.findIndex(a => ["--update", "--uninstall"].includes(a));
  const flag = argv[flagIndex];

  // Collect all candidate paths: CLI args (non-flag) + MANAO_PATH env
  const manaoPaths: string[] = [];

  if (process.env.MANAO_PATH) {
    manaoPaths.push(process.env.MANAO_PATH);
  }
  for (const a of argv) {
    if (!a.startsWith("--") && a !== argv[0]) manaoPaths.push(a);
  }

  if (flag === "--uninstall") return { mode: "uninstall", manaoPaths };
  if (flag === "--update")    return { mode: "update",    manaoPaths };

  // Auto-detect: if MANAO_PATH is set and the directory exists, offer menu
  return { mode: "install", manaoPaths };
}

// ── Updater ──────────────────────────────────────

async function runUpdate(installPath: string) {
  if (!existsSync(installPath)) {
    print.error(`Install path not found: ${installPath}`);
    process.exit(1);
  }

  const current = getInstalledVersion(installPath);

  print.line();
  print.header("   ManaoBot – Updater");
  print.line();
  print.info(`Installed path:    ${installPath}`);
  print.info(`Installed version: ${current}`);
  console.log();

  let releases: Release[];
  try {
    releases = await fetchReleases();
  } catch (e: any) {
    print.error(e.message);
    process.exit(1);
  }

  const releaseItems = releases.map((r) => ({
    label: `${r.tag_name}  —  ${new Date(r.published_at).toISOString().slice(0, 10)}`,
    tag: r.tag_name,
  }));

  const selectedVersion = pickFromList(releaseItems, "Update to version:").tag;

  if (selectedVersion === current) {
    print.warn(`Version ${selectedVersion} is already installed.`);
    if (!confirm("Reinstall anyway?", false)) {
      print.warn("Cancelled.");
      process.exit(0);
    }
  } else {
    print.warn(`Will update: ${current} → ${selectedVersion}`);
    if (!confirm("Continue?")) {
      print.warn("Cancelled.");
      process.exit(0);
    }
  }

  print.info("\nBacking up config files…");
  const backupDir = backup(installPath);

  print.info(`\nUpdating to ${selectedVersion}…`);
  gitUpdate(selectedVersion, installPath);
  print.success("Repository updated.");

  process.chdir(installPath);
  await ensureBun();

  print.info("\nInstalling dependencies…");
  run(["bun", "install"])
    ? print.success("Dependencies installed.")
    : print.warn("Dependency installation had issues.");

  print.info("\nRestoring config files…");
  restore(backupDir, installPath);
  print.success("Config files restored.");

  console.log();
  print.line();
  print.success(`ManaoBot updated  (${current} → ${getInstalledVersion(installPath)})`);
  print.success(`Path: ${installPath}`);
  print.line();
  console.log(`\nStart the bot with:  ${c.bold}bun run start${c.reset}\n`);
}

// ── Uninstaller ──────────────────────────────────

async function runUninstall(installPath: string) {
  if (!existsSync(installPath)) {
    print.error(`Install path not found: ${installPath}`);
    process.exit(1);
  }

  const current = getInstalledVersion(installPath);

  print.line();
  print.header("   ManaoBot – Uninstaller");
  print.line();
  print.info(`Install path:      ${installPath}`);
  print.info(`Installed version: ${current}`);
  console.log();

  // Offer to save config files before deletion
  let savedBackupDir: string | undefined;
  if (confirm("Save config & data files before uninstalling?")) {
    const defaultSave = join(HOME, "ManaoBot-backup");
    const saveTo = ask("Save backup to", defaultSave);
    mkdirSync(saveTo, { recursive: true });

    for (const name of BACKUP_GLOBS) {
      const src = join(installPath, name);
      if (existsSync(src)) {
        cpSync(src, join(saveTo, name));
        print.info(`  Saved ${name} → ${saveTo}`);
      }
    }
    try {
      for (const f of readdirSync(installPath)) {
        if (f.startsWith(".env") && !BACKUP_GLOBS.includes(f)) {
          cpSync(join(installPath, f), join(saveTo, f));
          print.info(`  Saved ${f} → ${saveTo}`);
        }
      }
    } catch { /* ignore */ }

    savedBackupDir = saveTo;
    print.success(`Config files saved to: ${saveTo}`);
    console.log();
  }

  print.warn(`This will permanently delete: ${installPath}`);
  if (!confirm("Are you sure you want to uninstall ManaoBot?", false)) {
    print.warn("Uninstall cancelled.");
    process.exit(0);
  }

  // Double-confirm for safety
  const typed = readLine(`${c.red}?${c.reset} Type "uninstall" to confirm:`).trim();
  if (typed !== "uninstall") {
    print.warn("Confirmation did not match. Uninstall cancelled.");
    process.exit(0);
  }

  print.info("\nRemoving ManaoBot…");
  try {
    rmSync(installPath, { recursive: true, force: true });
    print.success("ManaoBot directory removed.");
  } catch (e: any) {
    print.error(`Failed to remove directory: ${e.message}`);
    process.exit(1);
  }

  // Clean up MANAO_PATH env var on Windows
  if (IS_WINDOWS) {
    print.info("Removing MANAO_PATH environment variable…");
    Bun.spawnSync(["reg", "delete", "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
      "/v", "MANAO_PATH", "/f"], { stdout: "pipe", stderr: "pipe" });
    print.success("MANAO_PATH removed (machine scope).");
  } else {
    print.warn(`Remember to remove from your shell profile:  export MANAO_PATH="${installPath}"`);
  }

  console.log();
  print.line();
  print.success("ManaoBot has been uninstalled.");
  if (savedBackupDir) print.info(`Your data was saved to: ${savedBackupDir}`);
  print.line();
  console.log();
}

// ── Mode selection menu ───────────────────────────

async function pickMode(detectedPath: string | undefined): Promise<{ mode: Mode; path: string }> {
  print.line();
  print.header("   ManaoBot – Manager");
  print.line();

  if (detectedPath) {
    const version = getInstalledVersion(detectedPath);
    print.info(`Detected installation: ${detectedPath}  (v${version})`);
  }
  console.log();

  const options = [
    { label: "Install  – set up ManaoBot fresh",       mode: "install"   as Mode },
    { label: "Update   – update an existing install",  mode: "update"    as Mode },
    { label: "Uninstall – remove ManaoBot",            mode: "uninstall" as Mode },
  ];

  const picked = pickFromList(options, "What would you like to do?", detectedPath ? 1 : 0);

  let targetPath = detectedPath ?? DEFAULT_INSTALL_DIR;

  // If the user picked update/uninstall but we don't have a path yet, ask
  if ((picked.mode === "update" || picked.mode === "uninstall") && !detectedPath) {
    const raw = ask("Path to existing ManaoBot installation", DEFAULT_INSTALL_DIR);
    targetPath = raw.replace(/^~/, HOME);
  }

  return { mode: picked.mode, path: targetPath };
}

// ── Main ─────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const { mode: cliMode, manaoPaths } = detectMode(argv);

  // Resolve best known install path (prefer MANAO_PATH env, then CLI arg)
  const envPath = process.env.MANAO_PATH
    ? process.env.MANAO_PATH
    : undefined;
  const detectedPath = manaoPaths.find(p => existsSync(p)) ?? envPath;

  // If explicit flags were passed, skip the menu
  const hasExplicitFlag = argv.includes("--update") || argv.includes("--uninstall");

  let mode: Mode = cliMode;
  let installPath = detectedPath ?? DEFAULT_INSTALL_DIR;

  if (!hasExplicitFlag) {
    // Show interactive mode selection menu
    const picked = await pickMode(detectedPath);
    mode = picked.mode;
    installPath = picked.path;
  }

  // ── Dispatch ──────────────────────────────────

  if (mode === "uninstall") {
    await runUninstall(installPath);
    return;
  }

  if (mode === "update") {
    await runUpdate(installPath);
    return;
  }

  // ── Install flow (original logic) ─────────────

  const target = join(installPath, "manao");
  const isUpdate = existsSync(target);
  const current = isUpdate ? getInstalledVersion(target) : "";

  print.line();
  print.header(`   ManaoBot – ${isUpdate ? "Updater" : "Installer"}`);
  print.line();

  if (isUpdate) print.info(`Currently installed: ${current}`);

  let releases: Release[];
  try {
    releases = await fetchReleases();
  } catch (e: any) {
    print.error(e.message);
    process.exit(1);
  }

  const releaseItems = releases.map((r) => ({
    label: `${r.tag_name}  —  ${new Date(r.published_at).toISOString().slice(0, 10)}`,
    tag: r.tag_name,
  }));

  const selectedVersion = pickFromList(releaseItems, "Available versions:").tag;

  if (isUpdate) {
    if (selectedVersion === current) {
      print.warn(`Version ${selectedVersion} is already installed.`);
      if (!confirm("Reinstall anyway?", false)) {
        print.warn("Cancelled.");
        process.exit(0);
      }
    } else {
      print.warn(`Update: ${current} → ${selectedVersion}`);
      if (!confirm("Continue?")) {
        print.warn("Cancelled.");
        process.exit(0);
      }
    }
  }

  const finalInstallPath = isUpdate ? target : await pickInstallDir();
  console.log(`\n${c.cyan}Installation path:${c.reset} ${finalInstallPath}\n`);

  let backupDir: string | undefined;
  if (!isUpdate && existsSync(finalInstallPath) && readdirSync(finalInstallPath).length > 0) {
    print.warn(`${finalInstallPath} already exists and is not empty.`);
    if (!confirm("Overwrite?")) {
      print.warn("Cancelled.");
      process.exit(0);
    }
    print.info("Backing up existing files…");
    backupDir = backup(finalInstallPath);
    rmSync(finalInstallPath, { recursive: true, force: true });
  }

  mkdirSync(finalInstallPath, { recursive: true });

  await ensureGit();

  print.info(isUpdate ? `Updating to ${selectedVersion}…` : `Cloning ${selectedVersion}…`);
  isUpdate ? gitUpdate(selectedVersion, finalInstallPath) : gitClone(selectedVersion, finalInstallPath);
  print.success("Repository ready.");
  process.chdir(finalInstallPath);

  await ensureBun();
  await ensureTwitchCLI();

  print.info("\nInstalling dependencies…");
  run(["bun", "install"])
    ? print.success("Dependencies installed.")
    : print.warn("Dependency installation had issues. Check your connection.");

  if (backupDir) {
    print.info("\nRestoring backed-up files…");
    restore(backupDir, finalInstallPath);
    print.success("Files restored.");
  }

  if (IS_WINDOWS) {
    Bun.spawnSync(["setx", "MANAO_PATH", finalInstallPath, "/M"], { stdout: "inherit", stderr: "inherit" });
  } else {
    print.info(`Add to your shell profile: export MANAO_PATH="${finalInstallPath}"`);
  }

  if (confirm("\nRun the setup script now?")) run(["bun", "setup"]);

  console.log();
  print.line();
  print.success(`ManaoBot ${isUpdate ? "updated" : "installed"}  (${getInstalledVersion(finalInstallPath)})`);
  print.success(`Path: ${finalInstallPath}`);
  print.line();
  console.log(`\nStart the bot with:  ${c.bold}bun run start${c.reset}\n`);

  if (confirm("Open installation folder?")) {
    const opener = IS_WINDOWS ? "explorer" : IS_MAC ? "open" : "xdg-open";
    Bun.spawnSync([opener, finalInstallPath]);
  }
}

await main();