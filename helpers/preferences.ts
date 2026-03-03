import type {
  CommandArg,
  CustomMessages,
  CustomReply,
  LocalizedCommandArg,
  SongData,
} from "@/types";
import { getUserConfig, updateUserConfig } from "./database";

type LangCode = "en" | "th";
type CurrencyCode = string;

export function localizeCommandArgs(
  arg: Array<CommandArg>,
  lang: "en" | "th",
): Array<LocalizedCommandArg> {
  return arg?.map((a) => {
    return {
      ...a,
      name: a.name[lang],
      description: a.description[lang],
    };
  });
}

export async function getLang(): Promise<LangCode> {
  const config = await getUserConfig();
  return (config.lang as LangCode) ?? "en";
}

export async function updateLang(newLang: LangCode): Promise<void> {
  await updateUserConfig("lang", newLang);
}

export async function getCurrency(): Promise<CurrencyCode> {
  const config = await getUserConfig();
  return config.currency ?? "COIN";
}

export async function updateCurrency(newCurrency: CurrencyCode): Promise<void> {
  await updateUserConfig("currency", newCurrency);
}

export async function getDisabledCommands(): Promise<string[]> {
  const config = await getUserConfig();
  return config.disabledCommands ?? [];
}

export async function toggleCommand(commandName: string): Promise<boolean> {
  const disabledCommands = await getDisabledCommands();
  const index = disabledCommands.indexOf(commandName);

  if (index > -1) {
    disabledCommands.splice(index, 1);
  } else {
    disabledCommands.push(commandName);
  }

  await updateUserConfig("disabledCommands", disabledCommands);
  return index === -1;
}

export async function getSoundRewards(): Promise<any[]> {
  const config = await getUserConfig();
  return config.soundReward ?? [];
}

export async function getSoundFromRewardId(id: string): Promise<string | null> {
  const rewards = await getSoundRewards();
  const reward = rewards.find((r) => r.id === id);
  return reward ? reward.sound : null;
}

export async function updateSoundFromRewardId(id: string, sound: string): Promise<void> {
  const rewards = await getSoundRewards();
  const reward = rewards.find((r) => r.id === id);
  if (reward) {
    reward.sound = sound;
    await updateUserConfig("soundReward", rewards);
  } else {
    await addSoundReward({ id, sound });
  }
}

export async function addSoundReward(reward: { id: string; sound: string }): Promise<any[]> {
  const rewards = await getSoundRewards();
  rewards.push(reward);
  await updateUserConfig("soundReward", rewards);
  return rewards;
}

export async function removeSoundReward(rewardId: string): Promise<any[]> {
  const rewards = await getSoundRewards();
  const updatedRewards = rewards.filter((r) => r.id !== rewardId);
  await updateUserConfig("soundReward", updatedRewards);
  return updatedRewards;
}

export async function getCustomMessages(): Promise<CustomMessages> {
  const config = await getUserConfig();
  return config.customMessages ?? {
    onFollow: { en: "[user] just followed the channel!", th: "[user] ได้ติดตามช่องนี้!" },
    onSubscribe: { en: "[user] just subscribed to the channel!", th: "[user] ได้สมัครสมาชิกช่องนี้!" },
    onRaid: { en: "[user] just raided the channel with [viewers] viewers!", th: "[user] ได้บุกช่องนี้พร้อมกับผู้ชม [viewers] คน!" },
    onReSubscribe: { en: "[user] just resubscribed to the channel!", th: "[user] ได้สมัครสมาชิกช่องนี้อีกครั้ง!" },
  };
}

export async function updateCustomMessages(messages: CustomMessages): Promise<void> {
  await updateUserConfig("customMessages", messages);
}

export async function getCustomReplies(): Promise<CustomReply[]> {
  const config = await getUserConfig();
  return config.customReply ?? [];
}

export async function setCustomReplies(replies: CustomReply[]): Promise<void> {
  await updateUserConfig("customReply", replies);
}

export async function getDefaultSong(): Promise<SongData[]> {
  const config = await getUserConfig();
  return config.defaultSong ?? [];
}

export async function setDefaultSong(songs: SongData[]): Promise<void> {
  await updateUserConfig("defaultSong", songs);
}

export async function addDefaultSong(songs: SongData[]): Promise<SongData[]> {
  const existingSongs = await getDefaultSong();
  const updatedSongs = [...existingSongs, ...songs];
  await updateUserConfig("defaultSong", updatedSongs);
  return updatedSongs;
}

export function parseTemplate<T extends Record<string, any>>(
  template: string,
  data: T,
): string {
  return template.replace(/\[([^\]]+)]/g, (_, key: string) => {
    return key in data ? String(data[key]) : "";
  });
}