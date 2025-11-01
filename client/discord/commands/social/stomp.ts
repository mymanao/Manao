import { Category } from "@discordx/utilities";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  MessageFlags,
  type User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
@Category("Social")
export class StompCommand {
  @Slash({
    description: "Stomp on someone!",
  })
  async stomp(
    @SlashOption({
      name: "user",
      description: "The user you want to stomp on",
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,
    interaction: CommandInteraction,
  ): Promise<void> {
    const stompTimes = Math.floor(Math.random() * 1000) + 1;
    const lang = getLang();
    await interaction.reply({
      content: `${interaction.user} 👣 ${user} ${stompTimes} ${t("misc.times", lang)}!`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
