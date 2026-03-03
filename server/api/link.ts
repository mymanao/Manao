import { Elysia } from "elysia";
import { pendingLinks, consumeLinkCode } from "@helpers/linking.ts";

const API_TTL_MS = 5 * 60_000;

function findEntry(code: string, ttl: number) {
  return [...pendingLinks.entries()].find(
    ([, data]) =>
      data.code === code && Date.now() - data.createdAt < ttl,
  );
}

export function registerLinkAPI(app: Elysia) {
  app.get("/api/link/:code", ({ params, status }) => {
    const code = (params as { code: string }).code?.trim().toUpperCase();
    if (!code) return status(400);

    const entry = findEntry(code, API_TTL_MS);
    if (!entry) return status(404);

    const [internalID, data] = entry;

    return status(200, {
      internalID,
      platform: data.originPlatform,
      userID: data.userID,
      createdAt: data.createdAt,
      expiresAt: data.createdAt + API_TTL_MS,
    });
  });

  app.delete("/api/link/:code", ({ params, status }) => {
    const code = (params as { code: string }).code?.trim().toUpperCase();
    if (!code) return status(400);

    const entry = findEntry(code, API_TTL_MS);
    if (!entry) return status(404);

    const [internalID] = entry;
    consumeLinkCode(internalID);

    return status(200);
  });
}