import {
  addSoundReward,
  getSoundFromRewardId,
  removeSoundReward,
  updateSoundFromRewardId,
} from "@helpers/preferences.ts";
import type { HelixCustomReward } from "@twurple/api";
import type { Elysia } from "elysia";
import { apiClient } from "@/client/twitch";
import { TWITCH } from "@/config.ts";

export async function registerRewardsAPI(app: Elysia) {
  app.get("/api/rewards", async () => {
    const rewards = await apiClient.channelPoints.getCustomRewards(
      TWITCH.BROADCASTER.ID,
      true,
    );

    const rewardsData = [] as any[];
    rewards.forEach((reward: HelixCustomReward) => {
      rewardsData.push({
        id: reward.id,
        title: reward.title,
        cost: reward.cost,
        prompt: reward.prompt,
        isEnabled: reward.isEnabled,
        userInputRequired: reward.userInputRequired,
        globalCooldown: reward.globalCooldown,
        sound: getSoundFromRewardId(reward.id),
      });
    });

    return rewardsData;
  });

  app.post("/api/rewards", async ({ body }) => {
    const { name, cost, cooldown, sound, description } = body as {
      name: string;
      cost: number;
      description?: string;
      cooldown?: number;
      sound?: string;
    };

    const existingRewards = await apiClient.channelPoints.getCustomRewards(
      TWITCH.BROADCASTER.ID,
      true,
    );

    let reward = null;
    if (
      !existingRewards.some(
        (reward) => reward.title.toLowerCase() === name.toLowerCase(),
      )
    ) {
      reward = await apiClient.channelPoints.createCustomReward(
        TWITCH.BROADCASTER.ID,
        {
          title: name,
          cost,
          prompt: description,
          userInputRequired: false,
          globalCooldown: cooldown,
        },
      );
      if (sound) {
        addSoundReward({
          id: reward.id,
          sound,
        });
      }
    } else {
      const rewardId = existingRewards.find(
        (reward) => reward.title.toLowerCase() === name.toLowerCase(),
      )?.id;

      if (!rewardId) {
        throw new Error("Reward ID not found");
      }

      reward = await apiClient.channelPoints.updateCustomReward(
        TWITCH.BROADCASTER.ID,
        rewardId,
        {
          title: name,
          cost,
          prompt: description,
          globalCooldown: cooldown,
        },
      );

      if (sound) {
        updateSoundFromRewardId(reward.id, sound);
      }
    }
    return reward;
  });

  app.delete("/api/rewards/:rewardId", async ({ params }) => {
    const { rewardId } = params as unknown as { rewardId: string };
    try {
      await apiClient.channelPoints.deleteCustomReward(
        TWITCH.BROADCASTER.ID,
        rewardId,
      );
      removeSoundReward(rewardId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  app.post("/api/rewards/:rewardId/toggle", async ({ params, body }) => {
    const { rewardId } = params as unknown as { rewardId: string };
    const { isEnabled } = body as { isEnabled: boolean };

    try {
      const updatedReward = await apiClient.channelPoints.updateCustomReward(
        TWITCH.BROADCASTER.ID,
        rewardId,
        {
          isEnabled,
        },
      );
      return { success: true, reward: updatedReward };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
