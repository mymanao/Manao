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
export class LoveCommand {
  static metadata = {
    name: { en: "love", th: "" },
    description: {
      en: "How deep is your love?",
      th: "",
    }
  }
  @Slash({
    description: "How deep is your love?",
  })
  async love(
    @SlashOption({
      name: "user",
      description: "The user you love",
      type: ApplicationCommandOptionType.User,
      required: true,
    })
    user: User,
    interaction: CommandInteraction,
  ): Promise<void> {
    const lovePercent = Math.floor(Math.random() * 101);
    await interaction.reply({
      content: `${interaction.user} 💖 ${user} ${lovePercent}%`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
