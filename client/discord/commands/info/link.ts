import { Category } from "@discordx/utilities";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import { getLinkedID, initAccount } from "@helpers/database.ts";
import { generateLinkCode } from "@helpers/linking.ts";
import { type CommandInteraction, MessageFlagsBitField } from "discord.js";
import { Discord, Slash } from "discordx";

const lang = await getLang();

@Discord()
@Category("Info")
export class LinkCommand {
  static metadata = {
    name: { en: "link", th: "" },
    description: {
      en: "Generate a code to link your Discord account to Twitch or Kick",
      th: "",
    },
  };

  @Slash({
    name: "link",
    description: "Generate a code to link your Discord account to Twitch or Kick",
  })
  async link(interaction: CommandInteraction): Promise<void> {
    const discordID = interaction.user.id;

    const internalID =
      getLinkedID({ userID: discordID, platform: "discord" }) ??
      initAccount({ userID: discordID, platform: "discord" });

    const code = generateLinkCode({
      internalID,
      originPlatform: "discord",
      userID: discordID,
    });

    await interaction.reply({
      embeds: [
        templateEmbed({
          type: "default",
          title: t("discord.link.title", lang),
          fields: [{ name: t("discord.link.fieldName", lang), value: code, inline: true }],
          description: t("discord.link.description", lang),
          interaction,
        }),
      ],
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }
}