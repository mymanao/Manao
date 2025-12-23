import "@/client/twitch";
import { run } from "@/client/discord";
import { startServer } from "./server";
import { Server } from "socket.io";

startServer();

await run();

const io = new Server(4001, {
  cors: {
    origin: "*",
  },
});

console.log("Mock game server running on ws://localhost:4001");

let collecting = false;
let votes: Record<string, number> = {};

io.on("connection", (socket) => {
  console.log("Manao connected:", socket.id);

  // Receive chat messages from Manao
  socket.on("event:input", (data) => {
    if (!collecting) return;

    const vote = data.message.trim();
    votes[vote] = (votes[vote] ?? 0) + 1;

    console.log(`[VOTE] ${data.user}: ${vote}`);
  });

  // Start a round automatically (mock)
  setTimeout(() => {
    console.log("Round started");

    collecting = true;
    votes = {};

    socket.emit("event:start", {
      filter: "^[12]$", // only accept 1 or 2
    });
  }, 2000);

  // End round automatically
  setTimeout(() => {
    collecting = false;

    socket.emit("event:stop");

    const result = Object.entries(votes)
      .sort((a, b) => b[1] - a[1])[0];

    const summary = result
      ? `Round ended! Winning vote: ${result[0]} (${result[1]} votes)`
      : "Round ended! No votes.";

    socket.emit("event:send", {
      message: summary,
    });

    console.log("Round ended:", summary);
  }, 12000);

  socket.on("disconnect", () => {
    console.log("Manao disconnected");
  });
});
