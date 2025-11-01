import { Category } from "@discordx/utilities";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
@Category("Social")
export class EatCommand {
  @Slash({
    description: "What do you want to eat?",
  })
  async eat(interaction: CommandInteraction): Promise<void> {
    const lang = getLang();
    const foods = {
      th: [
        "ข้าว",
        "ก๋วยเตี๋ยว",
        "ส้มตำ",
        "ไก่ทอด",
        "ขนมจีน",
        "สเต็ก",
        "ไก่ย่าง",
        "หมูกระทะ",
        "หมูทอด",
        "หมูสะเต๊ะ",
        "หมูกรอบ",
        "หมูย่าง",
        "หมูทอดกรอบ",
        "หมูสามชั้น",
        "หมูสับ",
      ],
      en: [
        "rice",
        "noodles",
        "som tam",
        "fried chicken",
        "kanom jeen",
        "steak",
        "grilled chicken",
        "mookata",
        "fried pork",
        "moo satay",
        "crispy pork",
        "grilled pork",
        "crispy fried pork",
        "pork belly",
        "minced pork",
      ],
    };
    const food =
      foods[lang][Math.floor(Math.random() * foods[lang].length)] ?? "";
    await interaction.reply(t("misc.eat", lang, food));
  }
}
