import { getUserConfig, updateUserConfig } from "@helpers/database";
import type { Elysia } from "elysia";

export function registerConfigAPI(app: Elysia) {
  app.get("/api/config", async () => {
    return await getUserConfig();
  });

  app.post("/api/config", async ({ body }) => {
    try {
      const config = body as Record<string, any>;

      if (config.lang !== undefined) await updateUserConfig("lang", config.lang);
      if (config.currency !== undefined) await updateUserConfig("currency", config.currency);
      if (config.prefix !== undefined) await updateUserConfig("prefix", config.prefix);
      if (config.chatReward !== undefined) await updateUserConfig("chatReward", config.chatReward);
      if (config.customMessages !== undefined) await updateUserConfig("customMessages", config.customMessages);

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  return app;
}
