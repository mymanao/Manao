import { t } from "@helpers/i18n";
import { getLang } from "@helpers/preferences";
import {
  type CommandInteraction,
  version as discordjsVersion,
  MessageFlagsBitField,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { version as discordxVersion } from "discordx/package.json";
import { version as MANAO_VERSION } from "@/package.json";

@Discord()
export class VersionCommand {
  @Slash({
    name: "version",
    description: "Check bot's current version",
  })
  async version(interaction: CommandInteraction): Promise<void> {
    const lang = getLang();
    await interaction.reply({
      content: t(
        "info.versionDiscord",
        lang,
        MANAO_VERSION,
        discordjsVersion,
        discordxVersion,
        Bun.version,
      ),
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }
}
