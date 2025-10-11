const socket = createSocketConnection();

const status = document.getElementById("status");
const soundLog = document.getElementById("soundLog");
const audioPlayer = document.getElementById("audioPlayer");
const volumeSlider = document.getElementById("volumeSlider");
const volumeDisplay = document.getElementById("volumeDisplay");
const muteBtn = document.getElementById("muteBtn");
const hideBtn = document.getElementById("hideBtn");
const nowPlaying = document.getElementById("nowPlaying");
const currentSound = document.getElementById("currentSound");

let isMuted = true;
audioPlayer.volume = 0;

volumeSlider.addEventListener("input", () => {
  const vol = volumeSlider.value / 100;
  audioPlayer.volume = vol;
  volumeDisplay.textContent = `${volumeSlider.value}%`;

  if (vol > 0 && isMuted) {
    isMuted = false;
    muteBtn.textContent = "Mute";
    muteBtn.className = "btn btn-error";
  }
});

muteBtn.addEventListener("click", () => {
  if (isMuted) {
    isMuted = false;
    audioPlayer.volume = volumeSlider.value / 100;
    muteBtn.textContent = "Mute";
    muteBtn.className = "btn btn-error";
  } else {
    isMuted = true;
    audioPlayer.volume = 0;
    volumeSlider.value = 0;
    volumeDisplay.textContent = "0%";
    muteBtn.textContent = "Unmute";
    muteBtn.className = "btn btn-success";
  }
});

hideBtn.addEventListener("click", () => {
  document.body.classList.toggle("hidden");
  document.documentElement.style.background = "transparent";
});

socket.on("connect", () => {
  updateStatus("Connected", "alert alert-success w-full max-w-md text-center");
  addLogEntry("Connected to server");
});

socket.on("disconnect", () => {
  updateStatus("Disconnected", "alert alert-error w-full max-w-md text-center");
  addLogEntry("Disconnected from server");
});

socket.on("play-sound", ({ url, name }) => {
  audioPlayer.src = url;
  audioPlayer
    .play()
    .then(() => {
      addLogEntry(`Playing sound: ${name}`);
      currentSound.textContent = name;
      nowPlaying.classList.remove("hidden");
      audioPlayer.onended = () => nowPlaying.classList.add("hidden");
    })
    .catch((err) => addLogEntry(`Error: ${err.message}`));
});

function addLogEntry(msg) {
  const entry = document.createElement("div");
  entry.className = "text-sm";
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

  const logContainer = soundLog.querySelector("div");
  logContainer.appendChild(entry);
  soundLog.scrollTop = soundLog.scrollHeight;

  if (logContainer.childElementCount > 50) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

function updateStatus(text, className) {
  status.textContent = text;
  status.className = className;
}
