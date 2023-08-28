import {
  BodyProp,
  ParticipantProp,
  TokenDataProp,
  WsMessageProp,
} from "./data-types.ts";
import { HttpError } from "./deps.ts";
import PeerStore from "./peersStore.ts";
import {
  decode,
  encode,
} from "https://deno.land/std@0.199.0/encoding/base64.ts";
const peerStore = PeerStore.getInstance();
export const MAX_USER = 160;

// deno-lint-ignore no-explicit-any
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

export const updateRoomActivity: (room_uuid: string) => void = (
  room_uuid: string,
) => {
  const room = peerStore.getRoom(room_uuid);
  if (room) {
    room.last_active_at = Date.now();
    peerStore.updateRoom(room_uuid, room);
  }
};

export const broadcastToOthers: (
  room_uuid: string,
  user_uuid: string,
  message: WsMessageProp,
) => void = (
  room_uuid: string,
  user_uuid: string,
  message: WsMessageProp,
): void => {
  const room = peerStore.getRoom(room_uuid);
  if (room && room.participants) {
    for (const [peerId, data] of Object.entries(room.participants)) {
      if (
        peerId !== user_uuid && data.socket &&
        data.socket.readyState === WebSocket.OPEN
      ) {
        wsSend(data.socket, message);
      }
    }
  }
};

export const isValidBody: (body: BodyProp) => boolean = (
  body: BodyProp,
): boolean => {
  return body.user_uuid && body.room_uuid ? true : false;
};

export const validateRoomAccess: (body: TokenDataProp, socket: WebSocket) => void = (
  body: TokenDataProp,
  socket: WebSocket,
) => {
  const room = peerStore.getRoom(body.room_uuid);
  if (room && body.password && body.password !== room.password) {
    wsSend(socket, { type: "errorPassword", data: {} });
    throw new HttpError(401, "Wrong password");
  }

  if (room && Object.keys(room.participants).length >= MAX_USER) {
    wsSend(socket, { type: "full", data: {} });
    throw new HttpError(400, "Room full");
  }
};

export const wsSend = (ws: WebSocket, data: WsMessageProp): void => {
  ws.send(JSON.stringify(data));
};

export function generateToken(
  data: TokenDataProp,
): string {
  return encode(JSON.stringify(data));
}

export function validateBody({
  room_uuid,
  user_uuid,
}: {
  room_uuid: string;
  user_uuid: string;
}): void {
  if (!room_uuid || !user_uuid) {
    throw new HttpError(
      400,
      "RoomProp name or body identifier is missing from request body",
    );
  }
}

export const tryDecode = (str: string): TokenDataProp => {
  try {
    return JSON.parse(new TextDecoder().decode(decode(str)));
  } catch {
    throw new HttpError(400, "error token");
  }
};

/*
Untuk menghitung total waktu yang dihabiskan oleh pengguna, Anda dapat menambahkan seluruh durasi dari semua sesi:
*/
export function getTotalTime(participant: ParticipantProp): number {
  return participant.timelines.reduce((total, timeline) => {
    const end = timeline.end_at || Date.now(); // Jika sesi belum berakhir, gunakan waktu saat ini
    return total + (end - timeline.start_at);
  }, 0);
}

// Anda juga dapat membuat fungsi untuk mendapatkan timeline dari sesi pengguna:
export function _getTimeline(
  participant: ParticipantProp,
): { start_at: number; end_at?: number }[] {
  return participant.timelines.map((timeline) => ({
    start_at: timeline.start_at,
    end_at: timeline.end_at || Date.now(),
  }));
}
