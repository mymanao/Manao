import { promises as fs } from "fs"
import path from "path"
import { pathToFileURL } from "url"

export const categoryMap: Record<string, string> = {
  announce: "moderation",
  game: "moderation",
  shoutout: "moderation",
  stream: "moderation",
  event: "moderation",
  balance: "economy",
  gamble: "economy",
  autobet: "economy",
  give: "economy",
  leaderboard: "economy",
  set: "economy",
  eat: "social",
  hate: "social",
  love: "social",
  stomp: "social",
  help: "info",
  uptime: "info",
  version: "info",
  link: "info",
  nickname: "preferences",
  currency: "preferences",
  language: "preferences",
  ping: "info",
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
  modsOnly?: boolean
  broadcasterOnly?: boolean
  args?: {
    name: { en: string; th: string }
    description?: { en?: string; th?: string }
    required?: boolean
  }[]
}

type NormalizedCommand = {
  key: string
  name: { en: string; th: string }
  description: { en: string; th: string }
  aliases: { en: string[]; th: string[] }
  modsOnly: boolean
  broadcasterOnly: boolean
  args: {
    name: { en: string; th: string }
    description?: { en?: string; th?: string }
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

    if (mod.default && typeof mod.default === "object") {
      return mod.default as CommandMeta
    }

    if (typeof mod.default === "function" && "metadata" in mod.default) {
      return (mod.default as any).metadata as CommandMeta
    }

    for (const key of Object.keys(mod)) {
      const exported = mod[key]
      if (typeof exported === "function" && "metadata" in exported) {
        return (exported as any).metadata as CommandMeta
      }
      if (typeof exported === "object" && exported?.name?.en) {
        return exported as CommandMeta
      }
    }

    return null
  } catch {
    return null
  }
}

async function main() {
  const map = new Map<string, NormalizedCommand>()

  for (const platform of PLATFORMS) {
    const baseDir = path.join(ROOT, platform, "commands")

    try {
      await fs.access(baseDir)
      const files = await walk(baseDir)

      for (const file of files) {
        const cmd = await loadCommand(file)
        if (!cmd?.name?.en) continue

        const key = cmd.name.en.toLowerCase()
        const category = categoryMap[key]

        if (!category) {
          console.warn(`❌ Command "${key}" (${platform}) missing category`)
          continue
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
            modsOnly: cmd.modsOnly ?? false,
            broadcasterOnly: cmd.broadcasterOnly ?? false,
            args: cmd.args?.map((a) => ({
              name: a.name,
              description: a.description,
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
    } catch {
      continue
    }
  }

  const result = Array.from(map.values())
    .map((cmd) => ({
      ...cmd,
      platforms: cmd.platforms.sort(
        (a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b)
      ),
    }))
    .sort((a, b) => a.key.localeCompare(b.key))

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
  await fs.writeFile(OUTPUT, JSON.stringify(result, null, 2))

  console.log(`✅ Generated ${result.length} commands → ${OUTPUT}`)
}

main()