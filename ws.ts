// deno-lint-ignore-file
import { Handler, HttpError } from "./deps.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std@0.199.0/encoding/base64.ts";
import type { BodyProp, RoomProp, WsMessageProp } from "./data-types.ts";

let peers: Record<string, RoomProp> = {};
const MAX_USER = 160;

const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

const ensureRoomExists = (room_uuid: string): void => {
  if (!peers[room_uuid] || isEmptyObject(peers[room_uuid])) {
    peers[room_uuid] = {
      uuid: room_uuid,
      name: "",
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
    if (!peers[room_uuid].creator) peers[room_uuid].creator = "";
    if (
      !peers[room_uuid].participants ||
      isEmptyObject(peers[room_uuid].participants)
    ) {
      peers[room_uuid].creator = "";
    }
    if (!peers[room_uuid].chats || !Array.isArray(peers[room_uuid].chats)) {
      peers[room_uuid].chats = [];
    }
    if (!peers[room_uuid].password) peers[room_uuid].password = undefined;
    if (typeof peers[room_uuid].videoEnabled !== "boolean") {
      peers[room_uuid].videoEnabled = false;
    }
    if (typeof peers[room_uuid].soundEnabled !== "boolean") {
      peers[room_uuid].soundEnabled = false;
    }
    if (typeof peers[room_uuid].trackParticipantTimelineEnabled !== "boolean") {
      peers[room_uuid].trackParticipantTimelineEnabled = false;
    }
    if (
      typeof peers[room_uuid].trackParticipantCamTimelineEnabled !== "boolean"
    ) {
      peers[room_uuid].trackParticipantCamTimelineEnabled = false;
    }
    if (
      typeof peers[room_uuid].trackParticipantFaceTimelineEnabled !== "boolean"
    ) {
      peers[room_uuid].trackParticipantFaceTimelineEnabled = false;
    }
    if (typeof peers[room_uuid].lobbyEnabled !== "boolean") {
      peers[room_uuid].lobbyEnabled = false;
    }
    if (!peers[room_uuid].createdAt) peers[room_uuid].createdAt = Date.now();
    if (!peers[room_uuid].lastActiveAt) {
      peers[room_uuid].lastActiveAt = Date.now();
    }
  }
};

const checkAndCleanRooms: () => void = (): void => {
  const currentTime: number = Date.now();

  for (const room_uuid in peers) {
    const roomLife = currentTime - peers[room_uuid].createdAt;
    const inactiveDuration = currentTime - peers[room_uuid].lastActiveAt;

    if (
      roomLife > 7 * 24 * 60 * 60 * 1000 ||
      inactiveDuration > 5 * 24 * 60 * 60 * 1000
    ) {
      delete peers[room_uuid];
    }
  }
};

const updateRoomActivity: (room_uuid: string) => void = (room_uuid: string) => {
  if (peers[room_uuid]) {
    peers[room_uuid].lastActiveAt = Date.now();
  }
};

const isValidBody: (body: BodyProp) => boolean = (body: BodyProp): boolean =>
  body.user_uuid && body.room_uuid ? true : false;

const broadcastToOthers: (
  room_uuid: string,
  user_uuid: string,
  message: WsMessageProp
) => void = (
  room_uuid: string,
  user_uuid: string,
  message: WsMessageProp
): void => {
  for (const [peerId, data] of Object.entries(
    peers[room_uuid]?.participants || {}
  )) {
    if (
      peerId !== user_uuid &&
      data.socket &&
      data.socket.readyState === WebSocket.OPEN
    ) {
      wsSend(data.socket, message);
    }
  }
};

const wsSend = (ws: WebSocket, data: WsMessageProp): void => {
  ws.send(JSON.stringify(data));
};

const validateRoomAccess: (body: BodyProp, socket: WebSocket) => void = (
  body: BodyProp,
  socket: WebSocket
) => {
  ensureRoomExists(body.room_uuid);
  if (!isValidBody(body)) {
    wsSend(socket, { type: "errorToken", data: {} });
    throw new HttpError(400, "Invalid body");
  }
  if (body.password && body.password !== peers[body.room_uuid]?.password) {
    wsSend(socket, { type: "errorPassword", data: {} });
    throw new HttpError(401, "Wrong password");
  }
  if (Object.keys(peers[body.room_uuid].participants).length >= MAX_USER) {
    wsSend(socket, { type: "full", data: {} });
    throw new HttpError(400, "RoomProp full");
  }
};

function generateToken(body: any): string {
  return base64Encode(JSON.stringify(body));
}

function validateRoomAndUser({
  room_uuid,
  user_uuid,
}: {
  room_uuid: string;
  user_uuid: string;
}): void {
  if (!room_uuid || !user_uuid) {
    throw new HttpError(
      400,
      "RoomProp name or body identifier is missing from request body"
    );
  }
}

// Helper function to check if a room exists
const doesRoomExist = (room_uuid: string): boolean => !!peers[room_uuid];

setInterval(checkAndCleanRooms, 60 * 1000);

const tryDecode = (str: string): BodyProp => {
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
  rev.body = tryDecode(rev.params.token);
  return next();
};

const handler: Handler = (rev) => {
  const request = rev.request;
  const body = rev.body as BodyProp;
  const { socket, response } = Deno.upgradeWebSocket(request);

  if (request.headers.get("host")?.startsWith("localhost")) {
    if (!peers[body.room_uuid]) {
      peers[body.room_uuid] = {
        uuid: body.room_uuid,
        name: "",
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
    }
    if (!peers[body.room_uuid].participants[body.user_uuid]) {
      peers[body.room_uuid].participants[body.user_uuid] = {
        socket: null,
        status: "offline",
        sessions: [],
        name: body.user_name,
        approved: false,
        creator: false,
        uuid: body.user_uuid,
        videoEnabled: false,
        soundEnabled: false,
        camTimeline: [],
        faceTimeline: [],
      };
    }
  }

  socket.onopen = () => {
    try {
      updateRoomActivity(body.room_uuid);
      validateRoomAccess(body, socket);
      wsSend(socket, {
        type: "opening",
        data: {
          room_uuid: body.room_uuid,
          user_uuid: body.user_uuid,
          ...peers[body.room_uuid],
        },
      });

      if (!peers[body.room_uuid].participants[body.user_uuid]?.socket) {
        peers[body.room_uuid].participants[body.user_uuid].socket = null;
      }
      peers[body.room_uuid].participants[body.user_uuid].socket = socket;
      peers[body.room_uuid].participants[body.user_uuid].status = "online";
      peers[body.room_uuid].participants[body.user_uuid].sessions.push({
        startTime: Date.now(),
      });

      // Inform other peers about the body's status and initialization
      // wsSend(socket, {
      //   type: "initReceive",
      //   data: { user_uuid: body.user_uuid },
      // })

      broadcastToOthers(body.room_uuid, body.user_uuid, {
        type: "initReceive",
        data: {
          user_uuid: body.user_uuid,
          ...peers[body.room_uuid].participants[body.user_uuid],
        },
      });

      broadcastToOthers(body.room_uuid, body.user_uuid, {
        type: "userStatus",
        data: { user_uuid: body.user_uuid, status: "online" },
      });
    } catch (error) {
      console.error(error);
    }
  };

  socket.onmessage = (e) => {
    try {
      const { type, data } = JSON.parse(e.data);
      ensureRoomExists(body.room_uuid);
      updateRoomActivity(body.room_uuid);
      switch (type) {
        case "signal":
          /*
          "signal": Pesan tipe "signal" diterima dari pengguna dan kemudian diteruskan ke pengguna tujuan. Pesan ini sering digunakan untuk pertukaran sinyal dalam konteks WebRTC untuk menginisiasi atau menjaga koneksi peer-to-peer.

          Tindakan: Pesan diteruskan ke socket dari pengguna tujuan dengan menyesuaikan jenis pesan dan data.
          */
          wsSend(
            peers[body.room_uuid].participants[data.user_uuid]
              .socket as WebSocket,
            {
              type: "signal",
              data: { user_uuid: body.user_uuid, signal: data.signal },
            }
          );
          break;

        case "initSend":
          /*
          "initSend": Pesan tipe "initSend" diterima dari pengguna sebagai bagian dari inisiasi komunikasi.

          Tindakan: Pesan diteruskan ke socket dari pengguna tujuan dengan menyesuaikan jenis pesan dan data.
          */
          wsSend(
            peers[body.room_uuid].participants[data.user_uuid]
              .socket as WebSocket,
            {
              type: "initSend",
              data: {
                user_uuid: body.user_uuid,
                ...peers[body.room_uuid].participants[body.user_uuid],
              },
            }
          );
          break;

        case "chat":
          /*
          "chat": Pesan tipe "chat" diterima dari pengguna dan diumpankan ke obyek chats untuk menyimpan percakapan dalam ruangan.

          Tindakan: Pesan ditambahkan ke obyek chats. Pesan juga di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
          peers[body.room_uuid].chats.push({
            user_uuid: body.user_uuid,
            message: data.message,
          });
          broadcastToOthers(body.room_uuid, body.user_uuid, {
            type: "chat",
            data: { user_uuid: body.user_uuid, ...data },
          });
          break;

        case "toggleVideo":
          /*
          "toggleVideo": Pesan tipe "toggleVideo" diterima dari pengguna yang mengubah status video mereka (hidup/mati).

          Tindakan: Perubahan status video pengguna di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
          broadcastToOthers(body.room_uuid, body.user_uuid, {
            type: "toggleVideo",
            data: {
              user_uuid: data.user_uuid,
              videoEnabled: data.videoEnabled,
            },
          });
          break;

        case "toggleAudio":
          /*
          "toggleAudio": Pesan tipe "toggleAudio" diterima dari pengguna yang mengubah status suara mereka (hidup/mati).

          Tindakan: Perubahan status suara pengguna di-broadcast ke pengguna lain dalam ruangan menggunakan broadcastToOthers.
          */
          broadcastToOthers(body.room_uuid, body.user_uuid, {
            type: "toggleAudio",
            data: {
              user_uuid: data.user_uuid,
              audioEnabled: data.audioEnabled,
            },
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
    ensureRoomExists(body.room_uuid);
    updateRoomActivity(body.room_uuid);

    if (peers[body.room_uuid].participants[body.user_uuid]) {
      peers[body.room_uuid].participants[body.user_uuid].status = "offline";
    }

    // console.log("🚀 ~ file: ws.ts:299 ~ peers[body.room_uuid]:", peers[body.room_uuid])
    const currentSession =
      peers[body.room_uuid].participants[body.user_uuid].sessions.slice(-1)[0];
    if (currentSession && !currentSession.endTime) {
      currentSession.endTime = Date.now();
    }
    // Inform other peers that the current body has disconnected
    broadcastToOthers(body.room_uuid, body.user_uuid, {
      type: "userStatus",
      data: { user_uuid: body.user_uuid, status: "offline" },
    });
    // Remove the disconnected body from the participants list
    // delete peers[body.room_uuid].participants[body.user_uuid];

    // If no participants left in the room_uuid, delete the room_uuid
    // if (Object.keys(peers[body.room_uuid].participants).length === 0) {
    //   delete peers[body.room_uuid];
    // }
  };

  return response;
};

// Helper function to check if a body is a participant in a room

export const joinRoom: Handler<{
  body: BodyProp;
}> = (rev) => {
  // TODO: DEVELOP
  // if (
  //   !rev.headers.get("host").startsWith("localhost") &&
  //   !["http://localhost:8000", "https://roommeet.com"].includes(
  //     rev.headers.get("origin")
  //   )
  // ) {
  //   // rev.headers.host = "roommeet-1.deno.dev";
  //   throw new HttpError(401, "Unauthorized");
  // }

  const { body } = rev;
  const {
    room_uuid,
    password,
    user_uuid,
    user_name,
    videoEnabled,
    soundEnabled,
    approved,
    creator,
  } = body;
  console.log("🚀 ~ file: ws.ts:395 ~ body:", body);
  validateRoomAndUser(body);
  ensureRoomExists(room_uuid);

  if (!doesRoomExist(room_uuid)) {
    throw new HttpError(404, `RoomProp ${room_uuid} not found`);
  }

  if (!peers[room_uuid].participants[user_uuid]) {
    peers[room_uuid].participants[user_uuid] = {
      socket: null,
      status: "offline",
      sessions: [],
      uuid: user_uuid,
      name: user_name,
      videoEnabled: Boolean(videoEnabled),
      soundEnabled: Boolean(soundEnabled),
      approved: Boolean(approved),
      creator: Boolean(creator),
      camTimeline: [],
      faceTimeline: [],
    };
  }

  peers[room_uuid].participants[user_uuid].uuid = user_uuid;
  peers[room_uuid].participants[user_uuid].videoEnabled = Boolean(videoEnabled);

  if (Object.keys(peers[room_uuid].participants).length >= MAX_USER) {
    throw new HttpError(400, `RoomProp ${room_uuid} full`);
  }

  // TODO: DEVELOP
  if (rev.headers.get("host")?.startsWith("localhost") || true) {
    if (!peers[room_uuid].password && password) {
      peers[room_uuid].password = password;
    }
  }

  if (peers[room_uuid].password && peers[room_uuid].password !== password) {
    throw new HttpError(401, "Wrong password");
  }

  updateRoomActivity(room_uuid);

  const token = generateToken(body);
  const host = rev.headers.get("host");
  console.log({ token, host });
  return { token, host };
};

export const createRoom: Handler<{ body: BodyProp }> = ({ body }) => {
  const {
    user_uuid,
    room_uuid,
    password,
    videoEnabled,
    soundEnabled,
    trackParticipantTimelineEnabled,
    trackParticipantCamTimelineEnabled,
    trackParticipantFaceTimelineEnabled,
    lobbyEnabled,
  } = body;

  validateRoomAndUser(body);

  if (doesRoomExist(room_uuid)) {
    throw new HttpError(409, `RoomProp ${room_uuid} already exists`);
  }

  peers[room_uuid] = {
    uuid: room_uuid,
    name: body.room_name,
    creator: user_uuid,
    participants: {
      [user_uuid]: {
        socket: null,
        status: "offline",
        sessions: [],
        uuid: user_uuid,
        name: body.user_name,
        approved: true,
        creator: true,
        camTimeline: [],
        faceTimeline: [],
        videoEnabled: videoEnabled || false,
        soundEnabled: soundEnabled || false,
      },
    },
    chats: [],
    ...(password && { password }),
    videoEnabled: videoEnabled || false,
    soundEnabled: soundEnabled || false,
    trackParticipantTimelineEnabled: trackParticipantTimelineEnabled || false,
    trackParticipantCamTimelineEnabled:
      trackParticipantCamTimelineEnabled || false,
    trackParticipantFaceTimelineEnabled:
      trackParticipantFaceTimelineEnabled || false,
    lobbyEnabled: lobbyEnabled || false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  return { token: generateToken(body) };
};

export const wsLogin: Handler<{ body: BodyProp }> = async (rev, _next) => {
  const { body } = rev;
  const { room_uuid, room_name, user_uuid, user_name, password, approved, is_creator, video_enabled, sound_enabled, participant_timeline_enabled,  } = body;
};

export const getPeers = () => {
  return peers;
};

export const resetPeers = () => {
  peers = {};
  return peers;
};

export const getRoom: Handler = (rev) => {
  return peers[rev.params.room_uuid] ?? {};
};

export const wsHandlers: Handler[] = [middleware, handler];
