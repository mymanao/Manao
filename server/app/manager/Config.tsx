// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";

export function ConfigManager() {
  return (
    <main class="min-h-screen p-6">
      <h1 class="mb-2 text-center text-3xl font-bold">
        <i class="fas fa-sliders mr-2"></i> Config Editor
      </h1>
      <p class="text-base-content/60 mb-8 text-center text-sm">
        Changes are saved automatically to <code>userConfig.json</code>
      </p>

      {/* Toast */}
      <div
        id="toast"
        class="toast toast-top toast-end fixed z-9999999999999999999999999999999 hidden"
      >
        <div id="toast-inner" class="alert alert-success shadow-lg">
          <i class="fas fa-check-circle"></i>
          <span id="toast-msg">Saved!</span>
        </div>
      </div>

      <div class="mx-auto max-w-4xl space-y-6">
        {/* General */}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-xl">
              <i class="fas fa-gear text-primary mr-2"></i> General
            </h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Language</span>
                </label>
                <select id="lang" class="select select-bordered w-full">
                  <option value="en">English</option>
                  <option value="th">ภาษาไทย</option>
                </select>
              </div>
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Currency Name</span>
                </label>
                <input
                  id="currency"
                  type="text"
                  class="input input-bordered w-full"
                  placeholder="COIN"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prefixes */}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-xl">
              <i class="fas fa-terminal text-secondary mr-2"></i> Command
              Prefixes
            </h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Twitch Prefix</span>
                </label>
                <input
                  id="prefix-twitch"
                  type="text"
                  class="input input-bordered w-full"
                  maxlength="3"
                  placeholder="!"
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Kick Prefix</span>
                </label>
                <input
                  id="prefix-kick"
                  type="text"
                  class="input input-bordered w-full"
                  maxlength="3"
                  placeholder="!"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Rewards */}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-xl">
              <i class="fas fa-coins text-warning mr-2"></i> Chat Rewards
            </h2>
            <p class="text-base-content/60 mb-4 text-sm">
              Currency earned by chatters for sending messages.
            </p>

            {["twitch", "kick", "discord"].map((platform) => (
              <div class="mb-6">
                <h3 class="mb-3 flex items-center gap-2 font-semibold capitalize">
                  <i class={`fa-brands fa-${platform} text-lg`}></i> {platform}
                </h3>
                <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <label class="label">
                      <span class="label-text">Min</span>
                    </label>
                    <input
                      id={`chatReward-${platform}-min`}
                      type="number"
                      class="input input-bordered w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">Max</span>
                    </label>
                    <input
                      id={`chatReward-${platform}-max`}
                      type="number"
                      class="input input-bordered w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">Chance (0–1)</span>
                    </label>
                    <input
                      id={`chatReward-${platform}-chance`}
                      type="number"
                      class="input input-bordered w-full"
                      min="0"
                      max="1"
                      step="0.05"
                    />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">Cooldown (s)</span>
                    </label>
                    <input
                      id={`chatReward-${platform}-cooldown`}
                      type="number"
                      class="input input-bordered w-full"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Messages */}
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4 text-xl">
              <i class="fas fa-comment-dots text-accent mr-2"></i> Custom
              Messages
            </h2>
            <p class="text-base-content/60 mb-4 text-sm">
              Use <code>[user]</code> and <code>[viewers]</code> as
              placeholders.
            </p>

            {[
              { key: "onFollow", label: "On Follow", icon: "fa-heart" },
              { key: "onSubscribe", label: "On Subscribe", icon: "fa-star" },
              {
                key: "onResubscribe",
                label: "On Re-Subscribe",
                icon: "fa-rotate-right",
              },
              { key: "onRaid", label: "On Raid", icon: "fa-people-group" },
            ].map(({ key, label, icon }) => (
              <div class="mb-4">
                <h3 class="mb-2 flex items-center gap-2 font-semibold">
                  <i class={`fas ${icon} text-primary`}></i> {label}
                </h3>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label class="label">
                      <span class="label-text">English</span>
                    </label>
                    <input
                      id={`customMessages-${key}-en`}
                      type="text"
                      class="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label class="label">
                      <span class="label-text">Thai</span>
                    </label>
                    <input
                      id={`customMessages-${key}-th`}
                      type="text"
                      class="input input-bordered w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div class="flex justify-end pb-8">
          <button id="save-btn" class="btn btn-primary btn-lg" type="button">
            <i class="fas fa-save mr-2"></i> Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
