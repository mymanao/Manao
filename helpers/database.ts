import { Database } from "bun:sqlite";
import type { Command, UserData } from "@/types";
import { logger } from "./logger";

export const db = new Database("./bot-data.sqlite", { create: true });
export const customCommands: Map<string, Command> = fetchCommand();

export function initDatabase(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user TEXT PRIMARY KEY,
      money INTEGER DEFAULT 0,
      nickname TEXT
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
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
      discord_id TEXT PRIMARY KEY,
      twitch_id TEXT UNIQUE,
      kick_id TEXT UNIQUE,
      linked_at INTEGER DEFAULT (strftime('%s','now'))
    );

    INSERT OR IGNORE INTO config (key, value) VALUES
    ('defaultSong', '[]'),
    ('disabledCommands', '[]'),
    ('lang', 'en'),
    ('currency', 'COIN'),
    ('customMessages', ''),
    ('soundReward', '[]'),
    ('customReply', '[]');
  `);
}

export function initAccount(userID: string | number): void {
  const exists = db.prepare("SELECT 1 FROM users WHERE user = ?").get(userID);
  if (!exists) {
    db.prepare("INSERT INTO users (user, money) VALUES (?, ?)").run(userID, 0);
  }
}

export function getTwitchID(discordID: string): string {
  const row = db
    .prepare("SELECT twitch_id FROM linked_accounts WHERE discord_id = ?")
    .get(discordID);
  return (row as { twitch_id: string })?.twitch_id ?? "";
}

export function getTwitchIDFromKickID(kickID: string): string {
  const row = db
    .prepare("SELECT twitch_id FROM linked_accounts WHERE kick_id = ?")
    .get(kickID);
  return (row as { twitch_id: string })?.twitch_id ?? "";
}

export function getInfoFromKickID(kickID: string): UserData | undefined {
  const row = db
    .prepare(`
    SELECT u.* FROM users u
    INNER JOIN linked_accounts la ON la.twitch_id = u.user
    WHERE la.kick_id = ?
  `)
    .get(kickID);
  return row as UserData | undefined;
}

export function initAccountFromKick(kickID: string): void {
  const linkedRow = db
    .prepare("SELECT twitch_id FROM linked_accounts WHERE kick_id = ?")
    .get(kickID);
  const twitchID = (linkedRow as { twitch_id: string })?.twitch_id;
  if (!twitchID) return;
  initAccount(twitchID);
}

export function getNickname(userID: string | number): string | null {
  const row = db
    .prepare("SELECT nickname FROM users WHERE user = ?")
    .get(userID);
  return (row as UserData)?.nickname ?? null;
}

export function updateNickname(
  userID: string | number,
  nickname: string | null,
): void {
  db.prepare("UPDATE users SET nickname = ? WHERE user = ?").run(
    nickname,
    userID,
  );
}

export function getBalance(userID: string | number): number {
  const row = db.prepare("SELECT money FROM users WHERE user = ?").get(userID);
  return (row as Pick<UserData, "money">)?.money ?? 0;
}

export function addBalance(userID: string | number, amount: number): number {
  db.prepare("UPDATE users SET money = money + ? WHERE user = ?").run(
    amount,
    userID,
  );
  return getBalance(userID);
}

export function subtractBalance(
  userID: string | number,
  amount: number,
): number {
  db.prepare("UPDATE users SET money = money - ? WHERE user = ?").run(
    amount,
    userID,
  );
  return getBalance(userID);
}

export function setBalance(userID: string | number, amount: number): number {
  db.prepare("UPDATE users SET money = ? WHERE user = ?").run(amount, userID);
  return getBalance(userID);
}

export function addCommand(command: Command): void {
  try {
    db.prepare(`
      INSERT OR IGNORE INTO commands 
      (name, description, aliases, args, modsOnly, broadcasterOnly, disabled, execute)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      JSON.stringify(command.name),
      JSON.stringify(command.description),
      JSON.stringify(command.aliases || []),
      JSON.stringify(command.args || []),
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

export function fetchCommand(): Map<string, Command> {
  const rows = db.prepare("SELECT * FROM commands").all() as Array<
    Partial<Command>
  >;

  const commandList: Map<string, Command> = new Map();

  rows.forEach((row) => {
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
  });

  return commandList;
}

export function deleteCommand(commandName: string): void {
  db.prepare("DELETE FROM commands WHERE name = ?").run(commandName);

  if (customCommands.has(commandName)) {
    customCommands.delete(commandName);
  }
}

// Get balance for a Kick user and falls back to kick_id if not linked to Twitch
export function getKickBalance(kickID: string): number {
  const info = getInfoFromKickID(kickID);
  if (info) return info.money;
  // unlinked user: use kick_id directly as an account key
  const row = db
    .prepare("SELECT money FROM users WHERE user = ?")
    .get(`kick:${kickID}`) as
    | {
        money: number;
      }
    | undefined;
  return row?.money ?? 0;
}

export function initKickAccount(kickID: string): void {
  const linked = getInfoFromKickID(kickID);
  if (linked) return; // already linked, an account exists
  const key = `kick:${kickID}`;
  const exists = db.prepare("SELECT 1 FROM users WHERE user = ?").get(key);
  if (!exists) {
    db.prepare("INSERT INTO users (user, money) VALUES (?, 0)").run(key);
  }
}

export function addKickBalance(kickID: string, amount: number): void {
  const info = getInfoFromKickID(kickID);
  if (info) {
    addBalance(info.user, amount);
  } else {
    initKickAccount(kickID);
    db.prepare("UPDATE users SET money = money + ? WHERE user = ?").run(
      amount,
      `kick:${kickID}`,
    );
  }
}

export function subtractKickBalance(kickID: string, amount: number): void {
  const info = getInfoFromKickID(kickID);
  if (info) {
    subtractBalance(info.user, amount);
  } else {
    initKickAccount(kickID);
    db.prepare("UPDATE users SET money = money - ? WHERE user = ?").run(
      amount,
      `kick:${kickID}`,
    );
  }
}
