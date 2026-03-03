import { getCustomReplies, setCustomReplies } from "./preferences";
import type { CustomReply } from "@/types";

let _customReplies: CustomReply[] = [];

export async function initReplyStore(): Promise<void> {
  _customReplies = await getCustomReplies();
}

export function getReplyStore(): CustomReply[] {
  return _customReplies;
}

export async function invalidateReplyStore(): Promise<void> {
  _customReplies = await getCustomReplies();
}

export async function updateReplies(replies: CustomReply[]): Promise<void> {
  await setCustomReplies(replies);
  _customReplies = replies;
}