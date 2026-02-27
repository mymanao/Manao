import { getCustomReplies, setCustomReplies } from "./preferences";
import type { CustomReply } from "@/types";

// Single shared store — both Twitch and Kick clients read from this
let _customReplies: CustomReply[] = getCustomReplies();

export function getReplyStore(): CustomReply[] {
  return _customReplies;
}

// Call this after any update via the dashboard API
export function invalidateReplyStore(): void {
  _customReplies = getCustomReplies();
}

export function updateReplies(replies: CustomReply[]): void {
  setCustomReplies(replies);
  _customReplies = replies;
}
