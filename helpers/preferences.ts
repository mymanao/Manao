import type {
  CommandArg,
  CustomMessages,
  LocalizedCommandArg,
  SongData,
} from "@/types";
import { db, initDatabase } from "./database";

type LangCode = "en" | "th";
type CurrencyCode = string;

function getConfig(key: string, defaultValue: string): string {
  initDatabase();
  const stmt = db.prepare("SELECT value FROM config WHERE key = ?");
  const row = stmt.get(key) as { value?: string } | undefined;

  if (!row?.value) {
    const insert = db.prepare(
      "INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)",
    );
    insert.run(key, defaultValue);
    return defaultValue;
  }

  return row.value;
}

function setConfig(key: string, value: string): void {
  const stmt = db.prepare(
    "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  stmt.run(key, value);
}

export function localizeCommandArgs(
  arg: Array<CommandArg>,
  lang: "en" | "th",
): Array<LocalizedCommandArg> {
  return arg?.map((a) => {
    return {
      ...a,
      name: a.name[lang],
      description: a.description[lang],
    };
  });
}

export function getLang(): LangCode {
  return getConfig("lang", "en") as LangCode;
}

export function updateLang(newLang: LangCode): void {
  setConfig("lang", newLang);
}

export function getCurrency(): CurrencyCode {
  return getConfig("currency", "COIN");
}

export function updateCurrency(newCurrency: CurrencyCode): void {
  setConfig("currency", newCurrency);
}

export function getDisabledCommands(): string[] {
  const raw = getConfig("disabledCommands", "[]");
  try {
    return JSON.parse(raw) as string[];
  } catch {
    throw new Error("Failed to parse disabledCommands");
  }
}

export function toggleCommand(commandName: string): boolean {
  const disabledCommands = getDisabledCommands();
  const index = disabledCommands.indexOf(commandName);

  if (index > -1) {
    disabledCommands.splice(index, 1);
  } else {
    disabledCommands.push(commandName);
  }

  setConfig("disabledCommands", JSON.stringify(disabledCommands));
  return index === -1;
}

export function getCustomMessages(): CustomMessages {
  const raw = getConfig(
    "customMessages",
    JSON.stringify({
      onFollow: {
        en: "Thank you for following!",
        th: "ขอบคุณที่ติดตามนะ",
      },
      onSubscribe: {
        en: "Thank you for subscribing!",
        th: "ขอบคุณที่สมัครสมาชิกนะ",
      },
      onRaid: {
        en: "Thank you for the raid!",
        th: "ขอบคุณที่บุกมานะ",
      },
      onResubscribe: {
        en: "Thank you for resubscribing!",
        th: "ขอบคุณที่สมัครสมาชิกอีกครั้งนะ",
      },
    }),
  );
  try {
    return JSON.parse(raw) as CustomMessages;
  } catch {
    throw new Error("Failed to parse CustomMessages");
  }
}

export function getDefaultSong(): SongData[] {
  const raw = getConfig("defaultSong", "[]");
  try {
    return JSON.parse(raw) as SongData[];
  } catch {
    throw new Error("Failed to parse DefaultSong");
  }
}

export function setDefaultSong(songs: SongData[]): void {
  setConfig("defaultSong", JSON.stringify(songs));
}

export function addDefaultSong(songs: SongData[]): SongData[] {
  const existingSongs = getDefaultSong();
  const updatedSongs = [...existingSongs, ...songs];
  setConfig("defaultSong", JSON.stringify(updatedSongs));
  return updatedSongs;
}

export function parseTemplate<T extends Record<string, any>>(
  template: string,
  data: T,
): string {
  return template.replace(/\[([^\]]+)]/g, (_, key: string) => {
    return key in data ? String(data[key]) : "";
  });
}
