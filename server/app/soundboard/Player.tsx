// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import { Html } from "@elysiajs/html";

export function SoundboardPlayer() {
  return (
    <main class="flex min-h-screen flex-col items-center space-y-6 p-6">
      <h1 class="text-4xl font-bold">🔊 Sound Player</h1>

      <div id="status" class="alert alert-error w-full max-w-md text-center">
        Disconnected
      </div>

      <div class="card bg-base-200 w-full max-w-md shadow">
        <div class="card-body">
          <h3 class="card-title">Volume Control</h3>
          <div class="flex items-center justify-between">
            <label for="volumeSlider" class="font-medium">
              Volume:
            </label>
            <span id="volumeDisplay" class="font-semibold">
              0%
            </span>
          </div>
          <input
            type="range"
            id="volumeSlider"
            min="0"
            max="100"
            value="0"
            class="range range-primary w-full"
          />
          <div class="mt-4 flex justify-center space-x-4">
            <button id="muteBtn" class="btn btn-success">
              Unmute
            </button>
            <button id="hideBtn" class="btn btn-info">
              Hide
            </button>
          </div>
        </div>
      </div>

      <div
        id="nowPlaying"
        class="alert alert-info hidden w-full max-w-md text-center"
      >
        Now Playing:{" "}
        <span id="currentSound" class="font-bold">
          None
        </span>
      </div>

      <div
        id="soundLog"
        class="bg-base-200 h-64 w-full max-w-md overflow-y-auto rounded shadow"
      >
        <div class="space-y-1 p-2">
          <div class="text-sm">Waiting for sounds to play...</div>
        </div>
      </div>

      <audio id="audioPlayer" class="hidden"></audio>
    </main>
  );
}
