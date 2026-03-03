import { Category } from "@discordx/utilities";
import { templateEmbed } from "@helpers/discord/embed.ts";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import { addLinkedPlatform, getLinkedID, initAccount } from "@helpers/database.ts";
import {
  consumeLinkCode,
  generateLinkCode,
  validateLinkCode,
} from "@helpers/linking.ts";
import {
  type CommandInteraction,
  MessageFlagsBitField,
  SlashCommandStringOption,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

const lang = await getLang();

@Discord()
@Category("Info")
export class LinkCommand {
  static metadata = {
    name: { en: "link", th: "" },
    description: {
      en: "Generate a link code, or consume one from Twitch/Kick",
      th: "",
    },
  };

  @Slash({
    name: "link",
    description: "Generate a link code, or consume one from Twitch/Kick",
  })
  async link(
    @SlashOption(
      new SlashCommandStringOption()
      .setName("code")
      .setDescription("6-digit code from Twitch or Kick to link your accounts")
      .setRequired(false),
    )
    code: string | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
    const discordID = interaction.user.id;

    const internalID =
      getLinkedID({ userID: discordID, platform: "discord" }) ??
      initAccount({ userID: discordID, platform: "discord" });

    if (!code) {
      const newCode = generateLinkCode({
        internalID,
        originPlatform: "discord",
        userID: discordID,
      });

      await interaction.reply({
        embeds: [
          templateEmbed({
            type: "default",
            title: t("discord.link.title", lang),
            fields: [
              {
                name: t("discord.link.fieldName", lang),
                value: newCode,
                inline: true,
              },
            ],
            description: t("discord.link.description", lang),
            interaction,
          }),
        ],
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    const targetInternalID = validateLinkCode(code.trim().toUpperCase());

    if (!targetInternalID) {
      await interaction.reply({
        embeds: [
          templateEmbed({
            type: "error",
            title: t("discord.link.errorTitle", lang),
            description: t("configuration.errorCodeInvalidOrExpired", lang),
            interaction,
          }),
        ],
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    if (targetInternalID === internalID) {
      await interaction.reply({
        embeds: [
          templateEmbed({
            type: "error",
            title: t("discord.link.errorTitle", lang),
            description: t("configuration.errorLinkSelf", lang),
            interaction,
          }),
        ],
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    try {
      addLinkedPlatform({
        id: targetInternalID,
        platform: "discord",
        platformID: discordID,
      });
    } catch {
      await interaction.reply({
        embeds: [
          templateEmbed({
            type: "error",
            title: t("discord.link.errorTitle", lang),
            description: t("configuration.errorAlreadyLinked", lang),
            interaction,
          }),
        ],
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    consumeLinkCode(targetInternalID);

    await interaction.reply({
      embeds: [
        templateEmbed({
          type: "success",
          title: t("discord.link.successTitle", lang),
          description: t("configuration.linkSuccess", lang),
          interaction,
        }),
      ],
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  }
}