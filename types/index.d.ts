import type { ApiClient } from "@twurple/api";
import type { ChatClient } from "@twurple/chat";
import type { Server as SocketIOServer } from "socket.io";

export type Language = "en" | "th";
export type UserType = "bot" | "broadcaster";

export interface Localized<T = string> {
  en: T;
  th: T;
}

export interface CommandArg {
  name: Localized<string>;
  description: Localized<string>;
  required?: boolean;
}

export interface LocalizedCommandArg {
  name: string;
  description: string;
  required?: boolean;
}

export interface Command {
  name: Localized<string>;
  description: Localized<string>;
  aliases?: Localized<string[]>;
  args?: CommandArg[];
  modsOnly?: boolean;
  broadcasterOnly?: boolean;
  disabled?: boolean;
  execute: (
    client: ClientServices,
    meta: CommandMeta,
    message: string,
    args: string[],
  ) => void;
}

export interface ClientServices {
  chat: ChatClient;
  io: SocketIOServer;
  api: ApiClient;
}

export interface CommandMeta {
  user: string;
  channel: string;
  channelID: string;
  userID: string;
  commands: Map<string, Command>;
  lang: Language;
  currency: string;
}

export interface CustomReply {
  keywordType: "includes" | "equals";
  responseType: "random" | "sequence";
  keywords: string[];
  responses: string[];
}

export interface UserBadge {
  title?: string;
  link?: string;
}

export interface MessageData {
  from: string;
  message: string;
  user: string;
  id: string;
  role: string;
  color: string;
  badges: string[];
}

export type FeedType = "normal" | "error" | "success" | "neutral";

export interface FeedEvent {
  type: FeedType;
  icon: string;
  message: string;
  action: string;
}

export interface UserData {
  user: string;
  money: number;
  nickname: string;
  lastDaily: number;
  lastWeekly: number;
}

export interface PreferencesData {
  defaultSong: string;
  disabledCommands: string[];
  lang: Language;
  currency: string;
  customMessages: CustomMessages;
}

export type CustomMessages = {
  onFollow: Localized;
  onSubscribe: Localized;
  onRaid: Localized;
  onResubscribe: Localized;
};

export interface SongData {
  title: string;
  author: string;
  thumbnail: string;
  id: string;
}

export interface SongRequestData {
  user: string;
  song: SongData;
}
