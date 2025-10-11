import { logger } from "@helpers/logger.ts";
import { songQueue } from "@twitch/services/chat.ts";
import { Server, type Socket } from "socket.io";
import { SOCKET_PORT } from "@/config.ts";

function initializeSocketServer(): Server {
  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  }).listen(SOCKET_PORT);

  io.on("connection", handleOnSocketConnection);

  return io;
}

function handleOnSocketConnection(socket: Socket) {
  logger.info(`[Socket] ${socket.id} connected`);

  socket.on("disconnect", () => {
    logger.info(`[Socket] ${socket.id} disconnected`);
  });

  socket.on("songEnded", () => {
    songQueue.shift();
    socket.emit("songPlayNext", songQueue);
  });

  socket.on("songQueueFetch", () => {
    socket.emit("songQueue", songQueue);
  });

  socket.on("play-sound", (data) => {
    logger.info(`[Socket.IO] ${socket.id} playing`);
    socket.broadcast.emit("play-sound", data);
  });

  socket.on("currentSongProgress", (data) => {
    socket.broadcast.emit("currentSongProgress", data);
  });
}

export { initializeSocketServer };
