import type { KickItContext } from "@manaobot/kickit/types";
import { addLinkedPlatform, getLinkedID, initAccount } from "@helpers/database.ts";
import { t } from "@helpers/i18n.ts";
import { getLang } from "@helpers/preferences.ts";
import { consumeLinkCode, generateLinkCode, validateLinkCode } from "@helpers/linking.ts";
import type { CommandMeta } from "@/types";

export default {
  name: { en: "link", th: "เชื่อมบัญชี" },
  description: {
    en: "Link your Kick account to another platform, or generate a code for others to use",
    th: "เชื่อมบัญชี Kick กับแพลตฟอร์มอื่น หรือสร้างรหัสเพื่อให้แพลตฟอร์มอื่นเชื่อมมาหาคุณ",
  },
  aliases: { en: ["connect"], th: ["เชื่อม"] },
  args: [
    {
      name: { en: "code", th: "รหัสเชื่อมต่อ" },
      description: {
        en: "6-digit code from another platform, or leave blank to generate one",
        th: "รหัส 6 หลักจากแพลตฟอร์มอื่น หรือเว้นว่างเพื่อสร้างรหัส",
      },
      required: false,
    },
  ],
  execute: async (
    context: KickItContext,
    meta: CommandMeta,
    _message: string,
    args: string[],
  ): Promise<void> => {
    const code = args[0]?.trim().toUpperCase();
    const lang = await getLang();

    const internalID =
      getLinkedID({ userID: meta.userID, platform: "kick" }) ??
      initAccount({ userID: meta.userID, platform: "kick" });

    if (!code) {
      const newCode = generateLinkCode({
        internalID,
        originPlatform: "kick",
        userID: meta.userID,
      });
      await context.reply(
        `@${meta.user} ${t("configuration.linkCodeGenerated", lang)}: ${newCode}`,
      );
      return;
    }

    const targetInternalID = validateLinkCode(code);

    if (!targetInternalID) {
      await context.reply(
        `@${meta.user} ${t("configuration.errorCodeInvalidOrExpired", lang)}`,
      );
      return;
    }

    if (targetInternalID === internalID) {
      await context.reply(
        `@${meta.user} ${t("configuration.errorLinkSelf", lang)}`,
      );
      return;
    }

    addLinkedPlatform({ id: targetInternalID, platform: "kick", platformID: meta.userID });
    consumeLinkCode(targetInternalID);

    await context.reply(
      `@${meta.user} ${t("configuration.linkSuccess", lang)}`,
    );
  },
};