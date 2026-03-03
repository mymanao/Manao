import { addLinkedPlatform, getLinkedID, initAccount } from "@helpers/database";
import { t } from "@helpers/i18n";
import {
  consumeLinkCode,
  generateLinkCode,
  validateLinkCode,
} from "@helpers/linking";
import type { ClientServices, CommandMeta } from "@/types";

export default {
  name: { en: "link", th: "เชื่อมบัญชี" },
  description: {
    en: "Link your Twitch account to another platform, or generate a code for others to use",
    th: "เชื่อมบัญชี Twitch กับแพลตฟอร์มอื่น หรือสร้างรหัสเพื่อให้แพลตฟอร์มอื่นเชื่อมมาหาคุณ",
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
    client: ClientServices,
    meta: CommandMeta,
    _message: string,
    args: Array<string>,
  ) => {
    const code = args[0]?.trim().toUpperCase();

    const internalID =
      getLinkedID({ userID: meta.userID, platform: "twitch" }) ??
      initAccount({ userID: meta.userID, platform: "twitch" });

    if (!code) {
      const newCode = generateLinkCode({
        internalID,
        originPlatform: "twitch",
        userID: meta.userID,
      });
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.linkCodeGenerated", meta.lang)}: ${newCode}`,
      );
      return;
    }

    const targetInternalID = validateLinkCode(code);

    if (!targetInternalID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorCodeInvalidOrExpired", meta.lang)}`,
      );
      return;
    }

    if (targetInternalID === internalID) {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorLinkSelf", meta.lang)}`,
      );
      return;
    }

    try {
      addLinkedPlatform({
        id: targetInternalID,
        platform: "twitch",
        platformID: meta.userID,
      });
    } catch {
      await client.chat.say(
        meta.channel,
        `@${meta.user} ${t("configuration.errorAlreadyLinked", meta.lang)}`,
      );
      return;
    }

    consumeLinkCode(targetInternalID);

    await client.chat.say(
      meta.channel,
      `@${meta.user} ${t("configuration.linkSuccess", meta.lang)}`,
    );
  },
};
