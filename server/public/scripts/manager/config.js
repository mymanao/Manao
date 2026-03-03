const PLATFORMS = ["twitch", "kick", "discord"];

async function loadConfig() {
  const res = await fetch("/api/config");
  const config = await res.json();

  // General
  document.getElementById("lang").value = config.lang ?? "en";
  document.getElementById("currency").value = config.currency ?? "COIN";

  // Prefixes
  document.getElementById("prefix-twitch").value = config.prefix?.twitch ?? "!";
  document.getElementById("prefix-kick").value = config.prefix?.kick ?? "!";

  // Chat Rewards
  for (const platform of PLATFORMS) {
    const reward = config.chatReward?.[platform] ?? {};
    document.getElementById(`chatReward-${platform}-min`).value = reward.min ?? 1;
    document.getElementById(`chatReward-${platform}-max`).value = reward.max ?? 4;
    document.getElementById(`chatReward-${platform}-chance`).value = reward.chance ?? 0.75;
    document.getElementById(`chatReward-${platform}-cooldown`).value = reward.cooldown ?? 60;
  }

  // Custom Messages
  const msgs = config.customMessages ?? {};
  for (const key of ["onFollow", "onSubscribe", "onReSubscribe", "onRaid"]) {
    document.getElementById(`customMessages-${key}-en`).value = msgs[key]?.en ?? "";
    document.getElementById(`customMessages-${key}-th`).value = msgs[key]?.th ?? "";
  }
}

function buildPayload() {
  const chatReward = {};
  for (const platform of PLATFORMS) {
    chatReward[platform] = {
      min: Number(document.getElementById(`chatReward-${platform}-min`).value),
      max: Number(document.getElementById(`chatReward-${platform}-max`).value),
      chance: Number(document.getElementById(`chatReward-${platform}-chance`).value),
      cooldown: Number(document.getElementById(`chatReward-${platform}-cooldown`).value),
    };
  }

  const customMessages = {};
  for (const key of ["onFollow", "onSubscribe", "onReSubscribe", "onRaid"]) {
    customMessages[key] = {
      en: document.getElementById(`customMessages-${key}-en`).value,
      th: document.getElementById(`customMessages-${key}-th`).value,
    };
  }

  return {
    lang: document.getElementById("lang").value,
    currency: document.getElementById("currency").value,
    prefix: {
      twitch: document.getElementById("prefix-twitch").value,
      kick: document.getElementById("prefix-kick").value,
    },
    chatReward,
    customMessages,
  };
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const inner = document.getElementById("toast-inner");
  const msg = document.getElementById("toast-msg");

  inner.className = `alert alert-${type} shadow-lg`;
  msg.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => toast.classList.add("hidden"), 3000);
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';

  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    const data = await res.json();

    if (data.success) {
      showToast("Configuration saved!", "success");
    } else {
      showToast(`Error: ${data.error}`, "error");
    }
  } catch (err) {
    showToast("Failed to save. Check console.", "error");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
  }
});

loadConfig();
