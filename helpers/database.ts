import { Database } from "bun:sqlite";
import { customCommands } from "@twitch/services/chat";
import type { Command, UserData } from "@/types";
import { logger } from "./logger";

export const db = new Database("./bot-data.sqlite", { create: true });

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
  initDatabase();
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
