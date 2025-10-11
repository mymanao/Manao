const socket = createSocketConnection();

socket.on("feed", ({ type, icon, message, action }) => {
  const feedList = document.querySelector(".feedlist");
  if (!feedList) return;

  const feed = document.createElement("div");
  feed.className = `feed-container ${type}`;
  feed.innerHTML = `
    <div class="feed-icon">${icon}</div>
    <div class="feed-message">${message}</div>
    <div class="feed-action">${action}</div>
  `;

  feedList.appendChild(feed);

  setTimeout(() => feed.remove(), 10000);
});
