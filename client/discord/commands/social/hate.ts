import { Category } from "@discordx/utilities";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  MessageFlags,
  type User,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
@Category("Social")
export class HateCommand {
  @Slash({
    description: "For whom do you hate?",
  })
  async hate(
    @SlashOption({
      name: "user",
      description: "The user you hate",
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,
    interaction: CommandInteraction,
  ): Promise<void> {
    const hatePercent = Math.floor(Math.random() * 101);
    await interaction.reply({
      content: `${interaction.user} 👿 ${user} ${hatePercent}%`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
