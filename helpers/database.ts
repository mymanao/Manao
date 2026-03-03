import { Database } from "bun:sqlite";
import type { Command, Platform, UserConfig, UserData } from "@/types";
import { logger } from "./logger";

export const db = new Database("./bot-data.sqlite", { create: true });
export const customCommands: Map<string, Command> = new Map();

const CONFIG_PATH = `${process.cwd()}/userConfig.json`;

const defaultConfig: UserConfig = {
  prefix: { twitch: "!", kick: "!" },
  defaultSong: [],
  disabledCommands: [],
  lang: "en",
  currency: "COIN",
  customMessages: {
    onFollow: {
      en: "[user] just followed the channel!",
      th: "[user] ได้ติดตามช่องนี้!",
    },
    onSubscribe: {
      en: "[user] just subscribed to the channel!",
      th: "[user] ได้สมัครสมาชิกช่องนี้!",
    },
    onRaid: {
      en: "[user] just raided the channel with [viewers] viewers!",
      th: "[user] ได้บุกช่องนี้พร้อมกับผู้ชม [viewers] คน!",
    },
    onResubscribe: {
      en: "[user] just resubscribed to the channel!",
      th: "[user] ได้สมัครสมาชิกช่องนี้อีกครั้ง!",
    },
  },
  soundReward: [],
  customReply: [],
  chatReward: {
    kick: { min: 1, max: 4, chance: 0.75, cooldown: 60 },
    twitch: { min: 1, max: 4, chance: 0.75, cooldown: 60 },
    discord: { min: 1, max: 4, chance: 0.75, cooldown: 60 },
  },
};

export function initDatabase(): void {
  db.run(`
      CREATE TABLE IF NOT EXISTS users (
                                           id TEXT PRIMARY KEY,
                                           money INTEGER DEFAULT 0,
                                           nickname TEXT
      );

      CREATE TABLE IF NOT EXISTS commands (
                                              name TEXT PRIMARY KEY,
                                              description TEXT,
                                              aliases TEXT DEFAULT '[]',
                                              args TEXT DEFAULT '[]',
                                              modsOnly BOOLEAN DEFAULT 0,
                                              broadcasterOnly BOOLEAN DEFAULT 0,
                                              disabled BOOLEAN DEFAULT 0,
                                              execute TEXT
      );

      CREATE TABLE IF NOT EXISTS linked_accounts (
                                                     id TEXT PRIMARY KEY,
                                                     discord_id TEXT UNIQUE,
                                                     twitch_id TEXT UNIQUE,
                                                     kick_id TEXT UNIQUE,
                                                     linked_at INTEGER DEFAULT (strftime('%s','now'))
          );
  `);
}

/* ----------------------------------
   Account Linking
---------------------------------- */

export function initAccount(opts: { userID: string; platform: Platform }): string {
  const { userID, platform } = opts;
  const existing = getLinkedID({ userID, platform });
  if (existing) return existing;

  const id = Bun.randomUUIDv7();
  db.prepare(`INSERT INTO linked_accounts (id, ${platform}_id) VALUES (?, ?)`).run(id, userID);
  db.prepare("INSERT INTO users (id, money) VALUES (?, 0)").run(id);
  return id;
}

export function getLinkedID(opts: { userID: string; platform: Platform }): string | undefined {
  const row = db
  .prepare(`SELECT id FROM linked_accounts WHERE ${opts.platform}_id = ?`)
  .get(opts.userID) as { id: string } | undefined;
  return row?.id;
}

export function addLinkedPlatform(opts: {
  id: string;
  platform: Platform;
  platformID: string;
}): void {
  const { id, platform, platformID } = opts;
  const col = `${platform}_id`;

  const existingOwner = db
  .prepare(`SELECT id FROM linked_accounts WHERE ${col} = ?`)
  .get(platformID) as { id: string } | undefined;

  if (existingOwner) {
    if (existingOwner.id === id) return;
    mergeAccounts({ targetID: id, orphanID: existingOwner.id });
    return;
  }

  const targetExists = db
  .prepare("SELECT id FROM linked_accounts WHERE id = ?")
  .get(id) as { id: string } | undefined;

  if (targetExists) {
    db.prepare(`UPDATE linked_accounts SET ${col} = ? WHERE id = ?`).run(platformID, id);
  } else {
    db.prepare(`INSERT INTO linked_accounts (id, ${col}) VALUES (?, ?)`).run(id, platformID);
  }

  logger.info(`[Account Linking] Linked ${platform} (${platformID}) to ${id}`);
}

function mergeAccounts(opts: { targetID: string; orphanID: string }): void {
  const { targetID, orphanID } = opts;

  const orphan = db
  .prepare("SELECT * FROM linked_accounts WHERE id = ?")
  .get(orphanID) as Record<string, string> | undefined;

  if (!orphan) return;

  const orphanBalance = db
  .prepare("SELECT money FROM users WHERE id = ?")
  .get(orphanID) as { money: number } | undefined;

  // Delete orphan first to release UNIQUE constraints before copying its values
  db.prepare("DELETE FROM linked_accounts WHERE id = ?").run(orphanID);
  db.prepare("DELETE FROM users WHERE id = ?").run(orphanID);

  if (orphanBalance?.money) {
    db.prepare("UPDATE users SET money = money + ? WHERE id = ?").run(orphanBalance.money, targetID);
  }

  for (const p of ["discord", "twitch", "kick"] as Platform[]) {
    const col = `${p}_id`;
    if (orphan[col]) {
      db.prepare(`UPDATE linked_accounts SET ${col} = ? WHERE id = ?`).run(orphan[col], targetID);
    }
  }

  logger.info(`[Account Linking] Merged ${orphanID} into ${targetID}`);
}

/* ----------------------------------
   User Data
---------------------------------- */

export function getNickname(id: string): string | null {
  const row = db.prepare("SELECT nickname FROM users WHERE id = ?").get(id) as
    | Pick<UserData, "nickname">
    | undefined;
  return row?.nickname ?? null;
}

export function updateNickname(id: string, nickname: string | null): void {
  db.prepare("UPDATE users SET nickname = ? WHERE id = ?").run(nickname, id);
}

export function getBalance(id: string): number {
  const row = db.prepare("SELECT money FROM users WHERE id = ?").get(id) as
    | Pick<UserData, "money">
    | undefined;
  return row?.money ?? 0;
}

export function addBalance(id: string, amount: number): number {
  db.prepare("UPDATE users SET money = money + ? WHERE id = ?").run(amount, id);
  return getBalance(id);
}

export function subtractBalance(id: string, amount: number): number {
  db.prepare("UPDATE users SET money = money - ? WHERE id = ?").run(amount, id);
  return getBalance(id);
}

export function setBalance(id: string, amount: number): number {
  db.prepare("UPDATE users SET money = ? WHERE id = ?").run(amount, id);
  return getBalance(id);
}

/* ----------------------------------
   User Config
---------------------------------- */

export async function getUserConfig(): Promise<UserConfig> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) {
    await Bun.write(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return file.json();
}

export async function updateUserConfig<K extends keyof UserConfig>(
  key: K,
  value: UserConfig[K],
): Promise<void> {
  const config = await getUserConfig();
  config[key] = value;
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/* ----------------------------------
   Commands
---------------------------------- */

export function addCommand(command: Command): void {
  try {
    db.prepare(`
        INSERT OR IGNORE INTO commands
      (name, description, aliases, args, modsOnly, broadcasterOnly, disabled, execute)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      JSON.stringify(command.name),
      JSON.stringify(command.description),
      JSON.stringify(command.aliases ?? []),
      JSON.stringify(command.args ?? []),
      command.modsOnly ? 1 : 0,
      command.broadcasterOnly ? 1 : 0,
      command.disabled ? 1 : 0,
      command.execute.toString(),
    );
    customCommands.set(command.name.en, command);
    logger.info(`[Custom Command] Added command: ${command.name.en}`);
  } catch (error) {
    logger.error(`[Custom Command] Failed to add command: ${error}`);
    throw error;
  }
}

export function fetchCustomCommands(): Map<string, Command> {
  const rows = db.prepare("SELECT * FROM commands").all() as Array<Partial<Command>>;
  const commandList: Map<string, Command> = new Map();

  for (const row of rows) {
    try {
      const command: Command = {
        ...row,
        name: JSON.parse(String(row.name)),
        description: JSON.parse(String(row.description)),
        aliases: JSON.parse(String(row.aliases ?? "[]")),
        args: JSON.parse(String(row.args ?? "[]")),
      } as Command;
      commandList.set(command.name.en, command);
    } catch (error) {
      logger.error(`[Custom Command] Failed to parse command: ${row} ${error}`);
    }
  }

  return commandList;
}

export function deleteCommand(commandName: string): void {
  db.prepare("DELETE FROM commands WHERE name = ?").run(commandName);
  customCommands.delete(commandName);
}