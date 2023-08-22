import { Handler, HttpError } from "./deps.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std@0.199.0/encoding/base64.ts";
import type { Room, User, WsMessage } from "./data-types.ts";

let peers: Record<string, Room> = {};
const MAX_USER = 160;

const ensureRoomExists = (room: string): void => {
  if (!peers[room]) {
    peers[room] = {
      creator: "",
      participants: {},
      chats: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  }
};

const checkAndCleanRooms: () => void = (): void => {
  const currentTime: number = Date.now();

  for (const room in peers) {
    const roomLife = currentTime - peers[room].createdAt;
    const inactiveDuration = currentTime - peers[room].lastActiveAt;

    if (roomLife > 8 * 60 * 60 * 1000 || inactiveDuration > 15 * 60 * 1000) {
      delete peers[room];
    }
  }
};

const updateRoomActivity: (room: string) => void = (room: string) => {
  if (peers[room]) {
    peers[room].lastActiveAt = Date.now();
  }
};

setInterval(checkAndCleanRooms, 60 * 1000);

const isValidUser: (user: User) => boolean = (user: User): boolean =>
  user.user_id && user.room ? true : false;

const broadcastToOthers: (
  room: string,
  user_id: string,
  message: WsMessage,
) => void = (
  room: string,
  user_id: string,
  message: WsMessage,
): void => {
  for (
    const [peerId, data] of Object.entries(peers[room]?.participants || {})
  ) {
    if (
      peerId !== user_id && data.socket &&
      data.socket.readyState === WebSocket.OPEN
    ) {
      wsSend(data.socket, message);
    }
  }
};

const wsSend = (ws: WebSocket, data: WsMessage): void => {
  ws.send(JSON.stringify(data));
};

const tryDecode = (str: string): User => {
  try {
    return JSON.parse(new TextDecoder().decode(base64Decode(str)));
  } catch {
    throw new HttpError(400, "error token");
  }
};

// Middleware to validate the WebSocket request and decode user
const middleware: Handler = (rev, next) => {
  if (rev.request.headers.get("upgrade") !== "websocket") {
    throw new HttpError(400, "Protocol not supported");
  }
  rev.user = tryDecode(rev.params.token);
  return next();
};

const validateRoomAccess: (user: User, socket: WebSocket) => void = (
  user: User,
  socket: WebSocket,
) => {
  ensureRoomExists(user.room);
  if (!isValidUser(user)) {
    wsSend(socket, { type: "errorToken", data: {} });
    throw new HttpError(400, "Invalid user");
  }
  if (user.password && user.password !== peers[user.room]?.password) {
    wsSend(socket, { type: "errorPassword", data: {} });
    throw new HttpError(401, "Wrong password");
  }
  if (Object.keys(peers[user.room].participants).length >= MAX_USER) {
    wsSend(socket, { type: "full", data: {} });
    throw new HttpError(400, "Room full");
  }
};

const handler: Handler = ({ request, user }) => {
  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
    try {
      updateRoomActivity(user.room);
      validateRoomAccess(user, socket);
      wsSend(socket, {
        type: "opening",
        data: { room: user.room, user_id: user.user_id },
      });

      peers[user.room].participants[user.user_id].socket = socket;
      peers[user.room].participants[user.user_id].status = "online";
      peers[user.room].participants[user.user_id].sessions.push({
        startTime: Date.now(),
      });

      broadcastToOthers(user.room, user.user_id, {
        type: "userStatus",
        data: { user_id: user.user_id, status: "online" },
      });
      broadcastToOthers(user.room, user.user_id, {
        type: "initReceive",
        data: { user_id: user.user_id },
      });
    } catch (error) {
      console.error(error);
    }
  };

  socket.onmessage = (e) => {
    try {
      const { type, data } = JSON.parse(e.data);
      ensureRoomExists(user.room);
      updateRoomActivity(user.room);
      switch (type) {
        case "signal":
          wsSend(
            peers[user.room].participants[data.user_id].socket as WebSocket,
            {
              type: "signal",
              data: { user_id: user.user_id, signal: data.signal },
            },
          );
          break;

        case "initSend":
          wsSend(
            peers[user.room].participants[data.user_id].socket as WebSocket,
            {
              type: "initSend",
              data: { user_id: user.user_id },
            },
          );
          break;

        case "chat":
          peers[user.room].chats.push({
            user_id: user.user_id,
            message: data.message,
          });
          broadcastToOthers(user.room, user.user_id, {
            type: "chat",
            data: { user_id: user.user_id, message: data.message },
          });
          break;

        case "toggleVideo":
          broadcastToOthers(user.room, user.user_id, {
            type: "toggleVideo",
            data: { user_id: user.user_id, videoEnabled: data.videoEnabled },
          });
          break;

        case "toggleMute":
          broadcastToOthers(user.room, user.user_id, {
            type: "toggleMute",
            data: { user_id: user.user_id, soundEnabled: data.soundEnabled },
          });
          break;

        default:
          console.warn("Unhandled message type:", type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  socket.onclose = () => {
    ensureRoomExists(user.room);
    updateRoomActivity(user.room);

    if (peers[user.room].participants[user.user_id]) {
      peers[user.room].participants[user.user_id].status = "offline";
    }
    console.log(user.user_id, peers[user.room].participants[user.user_id].sessions);
    
    const currentSession =
      peers[user.room].participants[user.user_id].sessions.slice(-1)[0];
    if (currentSession && !currentSession.endTime) {
      currentSession.endTime = Date.now();
    }
    // Inform other peers that the current user has disconnected
    broadcastToOthers(user.room, user.user_id, {
      type: "userStatus",
      data: { user_id: user.user_id, status: "offline" },
    });
    // Remove the disconnected user from the participants list
    delete peers[user.room].participants[user.user_id];

    // If no participants left in the room, delete the room
    if (Object.keys(peers[user.room].participants).length === 0) {
      delete peers[user.room];
    }
  };

  return response;
};
function generateToken(body: User): string {
  return base64Encode(JSON.stringify(body));
}

function validateRoomAndUser(body: User): void {
  if (!body) {
    throw new HttpError(400, "Request body is missing");
  }

  const { room, user_id } = body;

  if (!room || !user_id) {
    throw new HttpError(
      400,
      "Room name or user identifier is missing from request body",
    );
  }
}

export const wsLogin: Handler = ({ body }) => {
  validateRoomAndUser(body as User);
  const { user_id, room, password } = body;

  if (peers[room]) {
    updateRoomActivity(room);
    ensureRoomExists(room);

    if (peers[room].participants?.[user_id]) {
      throw new HttpError(400, `User ${user_id} already exist`);
    }

    if (password && peers[room].password !== password) {
      throw new HttpError(401, "Wrong password");
    }

    if (Object.keys(peers[room].participants ?? {}).length >= MAX_USER) {
      throw new HttpError(400, `Room ${room} full`);
    }

    if (!peers[room].participants[user_id]) {
      peers[room].participants[user_id] = {
        socket: null,
        status: "online",
        sessions: [],
      };
    }

    if (peers[room].participants[user_id]) {
      peers[room].participants[user_id].status = "online";
      if (!peers[room].participants[user_id].socket) {
        peers[room].participants[user_id].socket = null;
      }
      if (!peers[room].participants[user_id].sessions) {
        peers[room].participants[user_id].sessions = [];
      }
    }
  } else {
    peers[room] = {
      creator: user_id,
      participants: {
        [user_id]: {
          socket: null,
          status: "online",
          sessions: [],
        },
      },
      chats: [],
      ...(password && { password }),
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  }

  return { token: generateToken(body as User) };
};

export const joinRoom: Handler = ({ body }) => {
  validateRoomAndUser(body as User);
  const { room, password, user_id } = body;
  updateRoomActivity(room);

  if (!peers[room]) {
    throw new HttpError(404, `Room ${room} not found`);
  }

  ensureRoomExists(room);

  if (!peers[room].participants[user_id]) {
    delete peers[room].participants[user_id];
  }

  if (Object.keys(peers[room].participants).length >= MAX_USER) {
    throw new HttpError(400, `Room ${room} full`);
  }

  if (peers[room].password && peers[room].password !== password) {
    throw new HttpError(401, "Wrong password");
  }

  return { token: generateToken(body as User) };
};

export const createRoom: Handler = ({ body }) => {
  validateRoomAndUser(body as User);

  const { user_id, room, password } = body;

  if (peers[room]) {
    throw new HttpError(409, `Room ${room} already exists`);
  }

  peers[room] = {
    creator: user_id,
    participants: {
      [user_id]: {
        socket: null,
        status: "offline",
        sessions: [],
      },
    },
    chats: [],
    ...(password && { password }),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  return { token: generateToken(body as User) };
};

export const getPeers = () => {
  return peers;
};

export const resetPeers = () => {
  peers = {};
  return peers;
};

export const getRoom: Handler = (rev) => {
  return peers[rev.params.room] ?? {};
};

export const wsHandlers: Handler[] = [middleware, handler];
