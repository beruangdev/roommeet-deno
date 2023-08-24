// deno-lint-ignore-file
import { Handler, HttpError } from "./deps.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std@0.199.0/encoding/base64.ts";
import type { Room, User, WsMessage } from "./data-types.ts";

let peers: Record<string, Room> = {
  "dev": {
    creator: "admin@local.com",
    participants: {
      "admin@local.com": {
        socket: null,
        status: "online",
        sessions: [],
      },
    },
    chats: [],
    password: "123",
    videoEnabled: true,
    soundEnabled: true,
    trackParticipantTimelineEnabled: false,
    trackParticipantCamTimelineEnabled: false,
    trackParticipantFaceTimelineEnabled: false,
    lobbyEnabled: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  },
};
const MAX_USER = 160;

const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

const ensureRoomExists = (room: string): void => {
  if (!peers[room] || isEmptyObject(peers[room])) {
    peers[room] = {
      creator: "",
      participants: {},
      chats: [],
      password: undefined,
      videoEnabled: false,
      soundEnabled: false,
      trackParticipantTimelineEnabled: false,
      trackParticipantCamTimelineEnabled: false,
      trackParticipantFaceTimelineEnabled: false,
      lobbyEnabled: false,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  } else {
    if (!peers[room].creator) peers[room].creator = "";
    if (!peers[room].participants || isEmptyObject(peers[room].participants)) {
      peers[room].creator = "";
    }
    if (!peers[room].chats || !Array.isArray(peers[room].chats)) {
      peers[room].chats = [];
    }
    if (!peers[room].password) peers[room].password = undefined;
    if (typeof peers[room].videoEnabled !== "boolean") {
      peers[room].videoEnabled = false;
    }
    if (typeof peers[room].soundEnabled !== "boolean") {
      peers[room].soundEnabled = false;
    }
    if (typeof peers[room].trackParticipantTimelineEnabled !== "boolean") {
      peers[room].trackParticipantTimelineEnabled = false;
    }
    if (typeof peers[room].trackParticipantCamTimelineEnabled !== "boolean") {
      peers[room].trackParticipantCamTimelineEnabled = false;
    }
    if (typeof peers[room].trackParticipantFaceTimelineEnabled !== "boolean") {
      peers[room].trackParticipantFaceTimelineEnabled = false;
    }
    if (typeof peers[room].lobbyEnabled !== "boolean") {
      peers[room].lobbyEnabled = false;
    }
    if (!peers[room].createdAt) peers[room].createdAt = Date.now();
    if (!peers[room].lastActiveAt) peers[room].lastActiveAt = Date.now();
  }
};

const checkAndCleanRooms: () => void = (): void => {
  const currentTime: number = Date.now();

  for (const room in peers) {
    const roomLife = currentTime - peers[room].createdAt;
    const inactiveDuration = currentTime - peers[room].lastActiveAt;

    if (
      roomLife > 7 * 24 * 60 * 60 * 1000 ||
      inactiveDuration > 5 * 24 * 60 * 60 * 1000
    ) {
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

      if (!peers[user.room].participants[user.user_id]?.socket) {
        peers[user.room].participants[user.user_id].socket = null;
      }
      peers[user.room].participants[user.user_id].socket = socket;
      peers[user.room].participants[user.user_id].status = "online";
      peers[user.room].participants[user.user_id].sessions.push({
        startTime: Date.now(),
      });

      // Inform other peers about the user's status and initialization
      broadcastToOthers(user.room, user.user_id, {
        type: "initReceive",
        data: { user_id: user.user_id },
      });

      broadcastToOthers(user.room, user.user_id, {
        type: "userStatus",
        data: { user_id: user.user_id, status: "online" },
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
          /*
          "signal": Pesan tipe "signal" diterima dari pengguna dan kemudian diteruskan ke pengguna tujuan. Pesan ini sering digunakan untuk pertukaran sinyal dalam konteks WebRTC untuk menginisiasi atau menjaga koneksi peer-to-peer.

          Tindakan: Pesan diteruskan ke socket dari pengguna tujuan dengan menyesuaikan jenis pesan dan data.
          */
          wsSend(
            peers[user.room].participants[data.user_id].socket as WebSocket,
            {
              type: "signal",
              data: { user_id: user.user_id, signal: data.signal },
            },
          );
          break;

        case "initSend":
          /*
          "initSend": Pesan tipe "initSend" diterima dari pengguna sebagai bagian dari inisiasi komunikasi.

          Tindakan: Pesan diteruskan ke socket dari pengguna tujuan dengan menyesuaikan jenis pesan dan data.
          */
          wsSend(
            peers[user.room].participants[data.user_id].socket as WebSocket,
            {
              type: "initSend",
              data: { user_id: user.user_id },
            },
          );
          break;

        case "chat":
          /*
          "chat": Pesan tipe "chat" diterima dari pengguna dan diumpankan ke obyek chats untuk menyimpan percakapan dalam ruangan.

          Tindakan: Pesan ditambahkan ke obyek chats. Pesan juga di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
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
          /*
          "toggleVideo": Pesan tipe "toggleVideo" diterima dari pengguna yang mengubah status video mereka (hidup/mati).

          Tindakan: Perubahan status video pengguna di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
          broadcastToOthers(user.room, user.user_id, {
            type: "toggleVideo",
            data: { user_id: user.user_id, videoEnabled: data.videoEnabled },
          });
          break;

        case "toggleSound":
          /*
          "toggleSound": Pesan tipe "toggleSound" diterima dari pengguna yang mengubah status suara mereka (hidup/mati).

          Tindakan: Perubahan status suara pengguna di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
          broadcastToOthers(user.room, user.user_id, {
            type: "toggleSound",
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
    // delete peers[user.room].participants[user.user_id];

    // If no participants left in the room, delete the room
    // if (Object.keys(peers[user.room].participants).length === 0) {
    //   delete peers[user.room];
    // }
  };

  return response;
};

function generateToken(body: any): string {
  return base64Encode(JSON.stringify(body));
}

function validateRoomAndUser(
  { room, user_id }: { room: string; user_id: string },
): void {
  if (!room || !user_id) {
    throw new HttpError(
      400,
      "Room name or user identifier is missing from request body",
    );
  }
}

// Helper function to check if a room exists
const doesRoomExist = (room: string): boolean => !!peers[room];

// Helper function to check if a user is a participant in a room

export const joinRoom: Handler<
  { body: { room: string; password?: string | undefined; user_id: string } }
> = ({ body }) => {
  const { room, password, user_id } = body;
  validateRoomAndUser(body);
  ensureRoomExists(room);

  if (!doesRoomExist(room)) {
    throw new HttpError(404, `Room ${room} not found`);
  }

  if (!peers[room].participants[user_id]) {
    peers[room].participants[user_id] = {
      socket: null,
      status: "offline",
      sessions: [],
    };
  }

  if (Object.keys(peers[room].participants).length >= MAX_USER) {
    throw new HttpError(400, `Room ${room} full`);
  }

  if (peers[room].password && peers[room].password !== password) {
    throw new HttpError(401, "Wrong password");
  }

  updateRoomActivity(room);

  return { token: generateToken(body) };
};

export const createRoom: Handler<{ body: User }> = ({ body }) => {
  const {
    user_id,
    room,
    password,
    videoEnabled,
    soundEnabled,
    trackParticipantTimelineEnabled,
    trackParticipantCamTimelineEnabled,
    trackParticipantFaceTimelineEnabled,
    lobbyEnabled,
  } = body;

  validateRoomAndUser(body);

  if (doesRoomExist(room)) {
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
    videoEnabled: videoEnabled || false,
    soundEnabled: soundEnabled || false,
    trackParticipantTimelineEnabled: trackParticipantTimelineEnabled || false,
    trackParticipantCamTimelineEnabled: trackParticipantCamTimelineEnabled ||
      false,
    trackParticipantFaceTimelineEnabled: trackParticipantFaceTimelineEnabled ||
      false,
    lobbyEnabled: lobbyEnabled || false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  return { token: generateToken(body) };
};

export const wsLogin: Handler<{ body: User }> = async (rev, _next) => {
  const { body } = rev;
  const { room } = body;
  if (doesRoomExist(room)) {
    return await joinRoom(rev, _next);
  } else {
    return await createRoom(rev, _next);
  }
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
