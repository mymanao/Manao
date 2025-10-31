import { bot } from "@discord/index";
import { Pagination } from "@discordx/pagination";
import { Category, type ICategory } from "@discordx/utilities";
import { templateEmbed } from "@helpers/embed.ts";
import { t } from "@helpers/i18n";
import { getLang } from "@helpers/preferences";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  MessageFlagsBitField,
} from "discord.js";
import type { DApplicationCommand } from "discordx";
import {
  Discord,
  MetadataStorage,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";

@Discord()
@Category("Info")
@SlashGroup({
  description: "Shows a list of all commands or info about a specific command.",
  name: "help",
})
@SlashGroup("help")
export class HelpCommand {
  @Slash({ description: "Show all available commands" })
  async all(interaction: CommandInteraction) {
    const lang = getLang();

    const commands = MetadataStorage.instance.applicationCommandSlashesFlat.map(
      (cmd: DApplicationCommand & ICategory) => {
        return {
          description: cmd.description,
          name: cmd.group ? `${cmd.group} (${cmd.name})` : cmd.name,
          category: cmd.category,
        };
      },
    );

    const categories = new Set(commands.map((c) => c.category || ""));
    const pages = Array.from(categories).map((category, idx) => {
      const categoryCommands = commands.filter((c) => c.category === category);
      const embed = templateEmbed({
        type: "default",
        title: t(
          "discord.help.helpPageTitle",
          lang,
          idx + 1,
          categories.size,
          category,
        ),
        footer: {
          text: t("discord.help.helpFooter", lang),
          iconURL: interaction.user.displayAvatarURL(),
        },
        thumbnail: bot.user?.displayAvatarURL(),
        interaction,
      });

      categoryCommands.forEach((c) => {
        embed.addFields({ name: `/${c.name}`, value: c.description });
      });

      return { embeds: [embed] };
    });

    const pagination = new Pagination(interaction, pages);
    await pagination.send();
  }

  @Slash({ description: "Show info about a specific command" })
  async command(
    @SlashOption({
      description: "The command name to get info about",
      name: "command",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    command: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    const lang = getLang();

    const cmd = MetadataStorage.instance.applicationCommandSlashesFlat.find(
      (c: DApplicationCommand & ICategory) => c.name === command,
    ) as DApplicationCommand & ICategory;

    if (!cmd) {
      await interaction.reply({
        content: t("info.errorCommandNotFound", lang, command),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }

    const embed = templateEmbed({
      type: "default",
      title: cmd.name.toUpperCase(),
      footer: {
        text: t("discord.help.helpBackToAll", lang),
        iconURL: interaction.user.displayAvatarURL(),
      },
      fields: [
        {
          name: t("discord.help.helpDescriptionField", lang),
          value: cmd.description,
          inline: false,
        },
        {
          name: t("discord.help.helpCategoryField", lang),
          value: String(cmd.category),
          inline: false,
        },
        {
          name: t("discord.help.helpOptionsField", lang),
          value:
            cmd.options
              ?.map((o) => `\`${o.name}\` - ${o.description}`)
              .join("\n") || t("discord.help.helpNoOptions", lang),
          inline: false,
        },
      ],
      thumbnail: bot.user?.displayAvatarURL(),
      interaction,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
