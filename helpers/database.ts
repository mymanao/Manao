import { Database } from "bun:sqlite";
import type { Command, Platform, UserConfig, UserData } from "@/types";
import { logger } from "./logger";

export const db = new Database("./bot-data.sqlite", { create: true });
export const customCommands: Map<string, Command> = new Map();

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

export async function initUserConfig(): Promise<void> {
  if (await Bun.file("userConfig.json").exists()) return;
  await Bun.write(
    "userConfig.json",
    JSON.stringify({
      prefix: {
        twitch: "!",
        kick: "!",
      },
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
        onReSubscribe: {
          en: "[user] just resubscribed to the channel!",
          th: "[user] ได้สมัครสมาชิกช่องนี้อีกครั้ง!",
        },
      },
      soundReward: [],
      customReply: [],
      chatReward: {
        kick: {
          min: 1,
          max: 4,
          chance: 0.75,
          cooldown: 60,
        },
        twitch: {
          min: 1,
          max: 4,
          chance: 0.75,
          cooldown: 60,
        },
        discord: {
          min: 1,
          max: 4,
          chance: 0.75,
          cooldown: 60,
        },
      },
    }),
  );
}

/* ----------------------------------
   Account Linking
---------------------------------- */

export function initAccount(opts: {
  userID: string;
  platform: Platform;
}): string {
  const { userID, platform } = opts;
  const linkedID = getLinkedID({ userID, platform });
  if (linkedID) return linkedID;

  const column = `${platform}_id`;
  const id = Bun.randomUUIDv7();

  db.prepare(`INSERT INTO linked_accounts (id, ${column}) VALUES (?, ?)`).run(
    id,
    userID,
  );

  db.prepare("INSERT INTO users (id, money) VALUES (?, 0)").run(id);
  return id;
}

export function getLinkedID(opts: {
  userID: string;
  platform: Platform;
}): string | undefined {
  const { userID, platform } = opts;
  const column = `${platform}_id`;

  const row = db
    .prepare(`SELECT id FROM linked_accounts WHERE ${column} = ?`)
    .get(userID) as { id: string } | undefined;

  return row?.id;
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
  return await Bun.file("userConfig.json").json();
}

export async function updateUserConfig<K extends keyof UserConfig>(
  key: K,
  value: UserConfig[K],
): Promise<void> {
  const config = await getUserConfig();
  config[key] = value;
  await Bun.write("userConfig.json", JSON.stringify(config, null, 2));
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
  const rows = db.prepare("SELECT * FROM commands").all() as Array<
    Partial<Command>
  >;

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
