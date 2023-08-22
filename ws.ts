import { Handler, HttpError } from "./deps.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std@0.199.0/encoding/base64.ts";
// import { assertEquals } from 'https://deno.land/std@0.199.0/testing/asserts.ts'
// deno-lint-ignore no-explicit-any
type TAny = any;

const MAX_USER = 160;
// const decoder = new TextDecoder();
// const encoder = new TextEncoder();
let peers: Record<string, Record<string, TAny | WebSocket>> = {};

function tryDecode(str: string): Record<string, TAny> {
  try {
    // const uint = Uint8Array.from(atob(str).split(",") as Iterable<number>);
    // return JSON.parse(decoder.decode(uint));
    const decodedValue = new TextDecoder().decode(base64Decode(str));
    return JSON.parse(decodedValue);
  } catch (_e) {
    throw new HttpError(400, "error token");
  }
}

function wsSend(ws: WebSocket, data: Record<string, TAny>): void {
  ws.send(JSON.stringify(data));
}

function isValidUser(user: TAny): boolean {
  return user.user_id && user.room;
}

const middleware: Handler = (rev, next) => {
  if (rev.request.headers.get("upgrade") != "websocket") {
    throw new HttpError(400, "Protocol not supported");
  }
  rev.user = tryDecode(rev.params.token);
  return next();
};

const handler: Handler = ({ request, user }) => {
  const { socket, response } = Deno.upgradeWebSocket(request);
  const { room, user_id, password } = user;

  socket.onopen = () => {
    if (!isValidUser(user)) {
      return wsSend(socket, { type: "errorToken", data: {} });
    }

    peers[room] = peers[room] || {};

    if (password && password !== peers[room]?.password) {
      return wsSend(socket, { type: "errorPassword", data: {} });
    }

    if (
      peers[room] && Object.keys(peers[room]["participants"]).length >= MAX_USER
    ) {
      return wsSend(socket, { type: "full", data: {} });
    }

    wsSend(socket, { type: "opening", data: { room, user_id } });
    peers[room]["participants"][user_id] = {};
    peers[room]["participants"][user_id]["socket"] = socket;

    for (const _user_id in peers[room]["participants"]) {
      const peerSocket =
        peers[room]["participants"][_user_id]["socket"] as WebSocket;
      if (_user_id !== user_id && peerSocket.readyState === WebSocket.OPEN) {
        wsSend(peerSocket, { type: "initReceive", data: { user_id } });
      }
    }
  };

  socket.onmessage = (e) => {
    const { type, data } = JSON.parse(e.data);

    switch (type) {
      case "signal":
        if (peers[room]["participants"][data.user_id].socket) {
          wsSend(
            peers[room]["participants"][data.user_id].socket as WebSocket,
            {
              type: "signal",
              data: { user_id, signal: data.signal },
            },
          );
        }
        break;
      case "initSend":
        wsSend(peers[room]["participants"][data.user_id].socket as WebSocket, {
          type: "initSend",
          data: { user_id },
        });
        break;
      case "chat":
        for (const _user_id in peers[room]["participants"]) {
          const peerSocket =
            peers[room]["participants"][_user_id]["socket"] as WebSocket;
          if (
            _user_id !== user_id && peerSocket.readyState === WebSocket.OPEN
          ) {
            peers[room]["chats"].push({ user_id, message: data.message });
            wsSend(peerSocket, {
              type: "chat",
              data: { user_id, message: data.message },
            });
          }
        }
        break;
      case "toggleVideo":
        for (const _user_id in peers[room]["participants"]) {
          const peerSocket =
            peers[room]["participants"][_user_id]["socket"] as WebSocket;
          if (
            _user_id !== user_id && peerSocket.readyState === WebSocket.OPEN
          ) {
            wsSend(peerSocket, {
              type: "toggleVideo",
              data: { user_id, videoEnabled: data.videoEnabled },
            });
          }
        }
        break;
      case "toggleMute":
        for (const _user_id in peers[room]["participants"]) {
          const peerSocket =
            peers[room]["participants"][_user_id]["socket"] as WebSocket;
          if (
            _user_id !== user_id && peerSocket.readyState === WebSocket.OPEN
          ) {
            wsSend(peerSocket, {
              type: "toggleMute",
              data: { user_id, soundEnabled: data.soundEnabled },
            });
          }
        }
        break;
    }
  };

  socket.onclose = () => {
    if (peers[room]) {
      for (const _user_id in peers[room]["participants"]) {
        const peerSocket =
          peers[room]["participants"][_user_id]["socket"] as WebSocket;
        if (_user_id !== user_id && peerSocket.readyState === WebSocket.OPEN) {
          wsSend(peerSocket as WebSocket, {
            type: "removePeer",
            data: { user_id },
          });
        } else {
          delete peers[room]["participants"][user_id];
        }
      }

      if (
        !Object.keys(peers[room]["participants"] ?? {}).includes(
          peers[room].creator,
        )
      ) {
        // for (const _user_id in peers[room]["participants"]) {
        //   const peerSocket =
        //     peers[room]["participants"][_user_id]["socket"] as WebSocket;
        //   wsSend(peerSocket as WebSocket, {
        //     type: "closeRoom",
        //     data: {},
        //   });
        // }
        // delete peers[room];
      } else if (Object.keys(peers[room]["participants"]).length === 0) {
        delete peers[room];
      }
    }
  };

  return response;
};

export const wsLogin: Handler = ({ body }) => {
  const { user_id, room, password } = body;

  if (peers[room]) {
    if (!peers[room]["participants"]) {
      delete peers[room];
    } else if (peers[room]["participants"][user_id]) {
      throw new HttpError(400, "User " + user_id + " already exist");
    } else {
      delete peers[room]["participants"][user_id];
    }

    if (peers[room]["password"] && peers[room]["password"] !== password) {
      throw new HttpError(401, "Wrong password");
    }

    if (Object.keys(peers[room]["participants"] ?? {}).length >= MAX_USER) {
      throw new HttpError(400, "Room " + room + " full");
    }
  } else {
    // Membuat ruangan baru
    peers[room] = {
      creator: user_id,
      participants: {}, // daftar peserta di ruangan
      chats: [],
    };

    // Jika password disediakan, tambahkan ke ruangan
    if (password) {
      peers[room]["password"] = null;
    }
  }

  // const token = btoa(encoder.encode(JSON.stringify(body)).toString());
  const token = base64Encode(JSON.stringify(body));

  return { token };
};

export const joinRoom: Handler = ({ body }) => {
  try {
    if (!body) {
      throw new HttpError(400, "Request body is missing");
    }

    const { room, password, user_id } = body;

    if (!room || !user_id) {
      throw new HttpError(
        400,
        "Room name or user identifier is missing from request body",
      );
    }

    if (!peers[room]) {
      throw new HttpError(404, `Room ${room} not found`);
    }

    if (!peers[room]["participants"][user_id]) {
      delete peers[room]["participants"][user_id];
    }

    if (Object.keys(peers[room]["participants"]).length >= MAX_USER) {
      throw new HttpError(400, `Room ${room} full`);
    }

    // Jika ruangan memiliki password dan tidak sesuai dengan yang diberikan
    if (peers[room].password && peers[room].password !== password) {
      throw new HttpError(401, "Wrong password");
    }

    // Anda mungkin juga ingin menambahkan user_id ke daftar participants di sini

    const token = base64Encode(JSON.stringify(body));
    return { token };
  } catch (error) {
    console.error(error);
    throw error;
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

export const createRoom: Handler = ({ body }) => {
  try {
    // Memeriksa apakah body ada
    if (!body) {
      throw new HttpError(400, "Request body is missing");
    }

    const { user_id, room, password } = body;

    // Memeriksa apakah room ada
    if (!user_id) {
      throw new HttpError(400, "user_id name is missing from request body");
    }
    if (!room) {
      throw new HttpError(400, "Room name is missing from request body");
    }

    // Memeriksa apakah ruangan sudah ada
    if (peers[room]) {
      throw new HttpError(409, `Room ${room} already exists`);
    }

    // Membuat ruangan baru
    peers[room] = {
      creator: user_id,
      participants: {}, // daftar peserta di ruangan
      chats: [],
    };

    // Jika password disediakan, tambahkan ke ruangan
    if (password) {
      peers[room].password = password;
    }

    // return { status: "Room created successfully" };
    const token = base64Encode(JSON.stringify(body));
    return { token };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const wsHandlers: Handler[] = [middleware, handler];
