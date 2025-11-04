import { Category } from "@discordx/utilities";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
@Category("Info")
export class PingCommand {
  @Slash({
    description: "Check the bot's responsiveness",
  })
  async ping(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({
      embeds: [
        templateEmbed({
          type: "success",
          title: "Pong!",
          description: t(
            "discord.ping.latency",
            getLang(),
            (Date.now() - interaction.createdTimestamp).toString(),
          ),
          interaction: interaction,
        }),
      ],
    });
  }
}
