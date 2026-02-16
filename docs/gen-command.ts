import { promises as fs } from "fs"
import path from "path"
import { pathToFileURL } from "url"

export const categoryMap: Record<string, string> = {
  // Moderation
  announce: "moderation",
  game: "moderation",
  shoutout: "moderation",
  stream: "moderation",
  event: "moderation",

  // Economy
  balance: "economy",
  gamble: "economy",
  autobet: "economy",
  give: "economy",
  leaderboard: "economy",
  set: "economy",

  // Social
  eat: "social",
  hate: "social",
  love: "social",
  stomp: "social",

  // Info
  help: "info",
  uptime: "info",
  version: "info",
  link: "info",

  // Preferences
  nickname: "preferences",
  currency: "preferences",
  language: "preferences",

  // Music (song-* only)
  "song-default": "music",
  "song-playing": "music",
  "song-queue": "music",
  "song-remove": "music",
  "song-request": "music",
  "song-skip": "music",
}

type Platform = "twitch" | "kick" | "discord"

type CommandMeta = {
  name: { en: string; th: string }
  description: { en: string; th: string }
  aliases?: { en?: string[]; th?: string[] }
  args?: {
    name: { en: string; th: string }
    required?: boolean
  }[]
}

type NormalizedCommand = {
  key: string
  name: { en: string; th: string }
  description: { en: string; th: string }
  aliases: { en: string[]; th: string[] }
  args: {
    name: { en: string; th: string }
    required: boolean
  }[]
  category: string
  platforms: Platform[]
}

const ROOT = path.resolve("client")
const OUTPUT = path.resolve("docs/data/commands.generated.json")

const PLATFORM_ORDER: Platform[] = ["twitch", "kick", "discord"]
const PLATFORMS: Platform[] = ["twitch", "kick", "discord"]

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath)
    }
  }

  return files
}

async function loadCommand(file: string): Promise<CommandMeta | null> {
  try {
    const mod = await import(pathToFileURL(file).href)
    return mod.default ?? null
  } catch {
    console.warn(`⚠️  Failed to load ${file}`)
    return null
  }
}

async function main() {
  const map = new Map<string, NormalizedCommand>()

  for (const platform of PLATFORMS) {
    const baseDir = path.join(ROOT, platform, "commands")

    try {
      const files = await walk(baseDir)

      for (const file of files) {
        const cmd = await loadCommand(file)
        if (!cmd?.name?.en) continue

        const key = cmd.name.en.toLowerCase()
        const category = categoryMap[key]

        const isSong = key.startsWith("song-")
        if (isSong && category !== "music") {
          throw new Error(
            `❌ Song command "${key}" must be in category "music"`
          )
        }

        if (!category) {
          throw new Error(
            `❌ Command "${key}" is missing category mapping`
          )
        }

        if (!map.has(key)) {
          map.set(key, {
            key,
            name: cmd.name,
            description: cmd.description,
            aliases: {
              en: cmd.aliases?.en ?? [],
              th: cmd.aliases?.th ?? [],
            },
            args:
              cmd.args?.map((a) => ({
                name: a.name,
                required: a.required ?? false,
              })) ?? [],
            category,
            platforms: [platform],
          })
        } else {
          const existing = map.get(key)!
          if (!existing.platforms.includes(platform)) {
            existing.platforms.push(platform)
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️  Skip ${platform}: ${(err as Error).message}`)
    }
  }

  const result = Array.from(map.values())
    .map((cmd) => ({
      ...cmd,
      platforms: cmd.platforms.sort(
        (a, b) =>
          PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b)
      ),
    }))
    .sort((a, b) => a.key.localeCompare(b.key))

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
  await fs.writeFile(OUTPUT, JSON.stringify(result, null, 2))

  console.log(`✅ Generated ${result.length} commands → ${OUTPUT}`)
}

main()
