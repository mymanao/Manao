import { Category } from "@discordx/utilities";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n";
import { getLang } from "@helpers/preferences.ts";
import { type CommandInteraction, MessageFlagsBitField } from "discord.js";
import { Discord, Slash } from "discordx";

const lang = getLang();

export const pendingLinks = new Map<
  string,
  { code: string; createdAt: number }
>();

@Discord()
@Category("Preferences")
export class LinkCommand {
  @Slash({ name: "link", description: "Link your Twitch account" })
  async link(interaction: CommandInteraction): Promise<void> {
    const discordID = interaction.user.id;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    pendingLinks.set(discordID, { code, createdAt: Date.now() });

    await interaction.reply({
      embeds: [
        templateEmbed({
          type: "default",
          title: t("discord.link.title", lang),
          fields: [
            {
              name: t("discord.link.fieldName", lang),
              value: code,
              inline: true,
            },
          ],
          description: t("discord.link.description", lang),
          interaction: interaction,
        }),
      ],
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }
}
