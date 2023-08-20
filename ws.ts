import { Handler, HttpError } from "./deps.ts";

// deno-lint-ignore no-explicit-any
type TAny = any;

const MAX_USER = 160;
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const peers: Record<string, Record<string, TAny | WebSocket>> = {};

function tryDecode(str: string): Record<string, TAny> {
  try {
    const uint = Uint8Array.from(atob(str).split(",") as Iterable<number>);
    return JSON.parse(decoder.decode(uint));
  } catch (_e) {
    throw new HttpError(400, "error token");
  }
}

function wsSend(ws: WebSocket, data: Record<string, TAny>): void {
  ws.send(JSON.stringify(data));
}

function isValidUser(user: TAny): boolean {
  return user.id && user.room;
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
  const { id, room, username } = user;

  socket.onopen = () => {
    if (!isValidUser(user)) {
      return wsSend(socket, { type: "errorToken", data: {} });
    }

    peers[room] = peers[room] || {};

    if (Object.keys(peers[room]).length >= MAX_USER) {
      return wsSend(socket, { type: "full", data: {} });
    }

    wsSend(socket, { type: "opening", data: { id, room, username } });

    peers[room][id] = socket;
    peers[room]["password"] = user.password;

    for (const _id in peers[room]) {
      const peerSocket = peers[room][_id] as WebSocket;
      if (_id !== id && peerSocket.readyState === WebSocket.OPEN) {
        wsSend(peerSocket, { type: "initReceive", data: { id } });
      }
    }
  };

  socket.onmessage = (e) => {
    const { type, data } = JSON.parse(e.data);

    switch (type) {
      case "signal":
        if (peers[room][data.id]) {
          wsSend(peers[room][data.id] as WebSocket, {
            type: "signal",
            data: { id, signal: data.signal },
          });
        }
        break;
      case "initSend":
        wsSend(peers[room][data.id] as WebSocket, {
          type: "initSend",
          data: { id },
        });
        break;
      case "chat":
        for (const _id in peers[room]) {
          const peerSocket = peers[room][_id] as WebSocket;
          if (_id !== id && peerSocket.readyState === WebSocket.OPEN) {
            wsSend(peers[room][_id] as WebSocket, {
              type: "chat",
              data: { id, message: data.message },
            });
          }
        }
        break;
      case "toggleVideo":
        for (const _id in peers[room]) {
          const peerSocket = peers[room][_id] as WebSocket;
          if (_id !== id && peerSocket.readyState === WebSocket.OPEN) {
            wsSend(peers[room][_id] as WebSocket, {
              type: "toggleVideo",
              data: { id, videoEnabled: data.videoEnabled },
            });
          }
        }
        break;
    }
  };

  socket.onclose = () => {
    for (const _id in peers[room]) {
      const peerSocket = peers[room][_id] as WebSocket;
      if (_id !== id && peerSocket.readyState === WebSocket.OPEN) {
        wsSend(peers[room][_id] as WebSocket, {
          type: "removePeer",
          data: { id },
        });
      } else {
        delete peers[room][_id];
      }
    }
    if (Object.keys(peers[room]).length === 0) {
      delete peers[room];
    }
  };

  return response;
};

const wsLogin: Handler = ({ body }) => {
  const { id, room, password } = body;

  if (peers[room]?.[id]) {
    throw new HttpError(400, "User " + id + " already exist");
  }

  if (Object.keys(peers[room] ?? {}).length >= MAX_USER) {
    throw new HttpError(400, "Room " + room + " full");
  }

  if (peers[room] && peers[room].password !== password) {
    throw new HttpError(401, "Wrong password");
  }

  const token = btoa(encoder.encode(JSON.stringify(body)).toString());

  return { token };
};

export const wsHandlers: Handler[] = [middleware, handler];
export { wsLogin };
