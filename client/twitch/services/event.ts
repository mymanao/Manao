import { io, Socket } from "socket.io-client";
import type { MessageData } from "@/types";
import { logger } from "@helpers/logger.ts";

let socket: Socket | null = null;
let isStarted = false;
let filter: RegExp | null = null;

export function initializeConnection(url: string, send: (msg: string) => void) {
  if (socket) socket.disconnect();
  const parsed = new URL(url);
  const sessionId = parsed.searchParams.get("session");
  socket = io(parsed.origin, {
    transports: ["websocket"],
    query: { session: sessionId },
    upgrade: false,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    if (sessionId) {
      socket?.emit("session:join", {
        sessionId,
        role: "manao",
      });
      logger.info(`[Event] Connected in session mode: ${sessionId}`);
    } else {
      logger.info("[Event] Connected in neutral mode");
    }

    send("Initialized event connection successfully!");
  });

  socket.on("disconnect", () => {
    logger.info(`[Event] Disconnected from ${url}`);
    isStarted = false;
    filter = null;
    send("Event disconnected!");
  });

  socket.on("event:start", (data: { filter: string }) => {
    isStarted = true;
    filter = data.filter ? new RegExp(data.filter, "i") : null;
  });

  socket.on("event:stop", () => {
    isStarted = false;
    filter = null;
  });

  socket.on("event:send", (data: { message: string }) => {
    send(data.message);
  });
}

export function disconnectConnection() {
  socket?.disconnect();
  socket = null;
  isStarted = false;
  filter = null;
}

export function handleEventMessage(
  data: Pick<MessageData, "message" | "user" | "from">,
) {
  if (!isStarted || !socket) return;
  if (filter && !filter.test(data.message)) return;
  socket.emit("event:input", { message: data.message, user: data.user });
}

export function isEventConnected(): boolean {
  return !!socket;
}
