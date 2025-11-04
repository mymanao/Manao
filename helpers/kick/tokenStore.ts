import fs from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

const envPath = resolve(process.cwd(), ".env");

export function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  return parseEnv(fs.readFileSync(envPath, "utf-8"));
}

export function updateEnv(updates: Record<string, string>) {
  if (!fs.existsSync(envPath)) {
    const content = Object.entries(updates)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    fs.writeFileSync(envPath, `${content}\n`);
    return;
  }

  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  const keysToInsert = new Map(Object.entries(updates));

  const newLines = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) return line;

    const key = match[1] ?? "";
    if (keysToInsert.has(key)) {
      const newVal = keysToInsert.get(key) ?? "";
      keysToInsert.delete(key);
      return `${key}=${newVal}`;
    }
    return line;
  });

  for (const [k, v] of keysToInsert) {
    newLines.push(`${k}=${v}`);
  }

  fs.writeFileSync(envPath, newLines.join("\n"));
}

export function saveTokens(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const expiresAt = Date.now() + data.expires_in * 1000;

  updateEnv({
    KICK_ACCESS_TOKEN: data.access_token,
    KICK_REFRESH_TOKEN: data.refresh_token,
    KICK_EXPIRES_AT: String(expiresAt),
  });
}

export function getAccessToken() {
  return readEnv().KICK_ACCESS_TOKEN;
}

export function getRefreshToken() {
  return readEnv().KICK_REFRESH_TOKEN;
}

export function isExpired() {
  const exp = Number(readEnv().KICK_EXPIRES_AT || 0);
  return !exp || Date.now() > exp - 60000;
}
