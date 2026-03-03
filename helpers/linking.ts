import type { Platform } from "@/types";

export interface PendingLinkEntry {
  code: string;
  createdAt: number;
  originPlatform: Platform;
  userID: string;
}

export const pendingLinks = new Map<string, PendingLinkEntry>();

const CODE_TTL_MS = 60_000;

export function generateLinkCode(opts: {
  internalID: string;
  originPlatform: Platform;
  userID: string;
}): string {
  const { internalID, originPlatform, userID } = opts;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  pendingLinks.set(internalID, {
    code,
    createdAt: Date.now(),
    originPlatform,
    userID,
  });

  return code;
}

export function validateLinkCode(code: string): string | undefined {
  const entry = [...pendingLinks.entries()].find(
    ([, data]) =>
      data.code === code && Date.now() - data.createdAt < CODE_TTL_MS,
  );
  return entry?.[0];
}

export function consumeLinkCode(internalID: string): void {
  pendingLinks.delete(internalID);
}