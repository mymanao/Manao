const socket = createSocketConnection();

let currentSong;
let queue = [];
let defaultSongs = [];
let defaultSongIndex = 0;
let ytPlayer;

fetch("/api/defaultSong")
  .then((res) => res.json())
  .then((data) => {
    defaultSongs = data.map((s) => ({
      song: {
        title: s.title,
        author: s.author,
        thumbnail: s.thumbnail,
        id: s.id,
      },
    }));
  });

function updateNowPlaying(song) {
  document.getElementById("songTitle").innerText = song.title;
  document.getElementById("author").innerText = song.author;
  document.getElementById("cover").src = song.thumbnail;
  Object.assign(document.getElementById("info-container").style, {
    backgroundImage: `url(${song.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });
}

function playSong(songID) {
  document.getElementById("playframe").src =
    `https://www.youtube.com/embed/${songID}?autoplay=1&enablejsapi=1`;
}

function playDefaultSong() {
  if (!defaultSongs.length) return;
  if (defaultSongIndex >= defaultSongs.length) defaultSongIndex = 0;
  const song = defaultSongs[defaultSongIndex++].song;
  updateNowPlaying(song);
  playSong(song.id);
}

socket.emit("songQueueFetch");

socket.on("songQueue", (data) => {
  queue = data;
  if (queue.length) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  } else playDefaultSong();
});

socket.on("songRequest", ({ queue: q, index }) => {
  queue = q;
  if (index === 0) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  }
});

socket.on("songRemove", (data) => {
  queue = data;
});

socket.on("songPlayNext", (data) => {
  queue = data;
  if (queue.length > 0) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  } else {
    playDefaultSong();
  }
});

socket.on("songSkip", (data) => {
  queue = data;
  if (queue.length) {
    currentSong = queue[0];
    updateNowPlaying(currentSong.song);
    playSong(currentSong.song.id);
  } else {
    playDefaultSong();
  }
});

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player("playframe");
};

window.addEventListener("message", (e) => {
  if (e.origin === "https://www.youtube.com") {
    try {
      const playerData = JSON.parse(e.data);
      if (
        playerData.event === "infoDelivery" &&
        playerData.info.playerState === YT.PlayerState.ENDED
      ) {
        socket.emit("songEnded");
      }
    } catch {}
  }
});

setInterval(() => {
  if (!ytPlayer) return;
  const current = ytPlayer.getCurrentTime();
  const duration = ytPlayer.getDuration();
  if (duration > 0) {
    const percent = (current / duration) * 100;
    document.getElementById("progress").value = percent;
    socket.emit("currentSongProgress", { currentPercent: percent });
  }
}, 1000);

document.getElementById("np").addEventListener("click", () => {
  const player = document.getElementById("player");
  player.style.display = player.style.display === "none" ? "block" : "none";
});
