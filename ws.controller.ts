// rafactor kode fungsi handler, dan tulis dengan lengkap !!!
// ws.controller.ts
import { TokenDataProp, WsMessageProp } from "./data-types.ts";
import { Handler, HttpError } from "./deps.ts";
import PeerStore from "./peersStore.ts";

import {
  broadcastToOthers,
  tryDecode,
  updateRoomActivity,
  validateRoomAccess,
  wsSend,
} from "./ws-libs.ts";

const peerStore = PeerStore.getInstance();

const handler: Handler = (rev) => {
  const request = rev.request;
  const body = rev.body as TokenDataProp;
  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
    try {
      updateRoomActivity(body.room_uuid);
      validateRoomAccess(body, socket);

      const room = peerStore.getRoom(body.room_uuid);
      wsSend(socket, {
        type: "opening",
        data: {
          room_uuid: body.room_uuid,
          user_uuid: body.user_uuid,
          ...room,
          myy: peerStore.getParticipant(body.room_uuid, body.user_uuid),
        },
      });

      const participant = peerStore.getParticipant(
        body.room_uuid,
        body.user_uuid
      );
      if (participant) {
        participant.socket = socket as WebSocket;
        participant.status = "in_room";
        participant.timelines.push({ start_at: Date.now() });
        peerStore.updateParticipant(
          body.room_uuid,
          participant.uuid,
          participant
        );
      }

      broadcastToOthers(body.room_uuid, body.user_uuid, {
        type: "initReceive",
        data: {
          user_uuid: body.user_uuid,
          ...peerStore.getParticipant(body.room_uuid, body.user_uuid),
        },
      });

      broadcastToOthers(body.room_uuid, body.user_uuid, {
        type: "userStatus",
        data: { user_uuid: body.user_uuid, status: "in_room" },
      });
    } catch (error) {
      console.error(error);
    }
  };

  //  TODO Buat dalam class
  socket.onmessage = (event: MessageEvent) => {
    try {
      const { type, data } = JSON.parse(event.data) as WsMessageProp;
      if (!peerStore.getRoom(body.room_uuid)) {
        throw new HttpError(404, `Room ${body.room_uuid} not found`);
      }
      const participant = peerStore.getParticipant(
        body.room_uuid,
        body.user_uuid
      );
      const room = peerStore.getRoom(body.room_uuid);

      updateRoomActivity(body.room_uuid);

      if (type === "signal" && participant) {
        wsSend(participant.socket as WebSocket, {
          type: "signal",
          data: { user_uuid: body.user_uuid, signal: data.signal },
        });
      } else if (type === "initSend" && participant) {
        wsSend(participant.socket as WebSocket, {
          type: "initSend",
          data: {
            user_uuid: body.user_uuid,
            ...peerStore.getParticipant(body.room_uuid, body.user_uuid),
          },
        });
      } else if (type === "chat") {
        room?.chats.push({
          user_uuid: body.user_uuid,
          message: data.message,
        });
        peerStore.updateRoom(body.room_uuid, { chats: room?.chats });
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: "chat",
          data: { user_uuid: body.user_uuid, message: data.message },
        });
      } else if (type === "toggleVideo") {
        peerStore.updateParticipant(body.room_uuid, data.user_uuid, {
          video_enabled: data.video_enabled,
        });
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: "toggleVideo",
          data: {
            user_uuid: data.user_uuid,
            video_enabled: data.video_enabled,
          },
        });
      } else if (type === "toggleAudio") {
        peerStore.updateParticipant(body.room_uuid, data.user_uuid, {
          audio_enabled: data.audio_enabled,
        });
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: "toggleAudio",
          data: {
            user_uuid: data.user_uuid,
            audio_enabled: data.audio_enabled,
          },
        });
      } else if (type === "resumePeerStream") {
        const senderParticipant = peerStore.getParticipant(
          body.room_uuid,
          data.sender_uuid
        );
        wsSend(senderParticipant?.socket as WebSocket, {
          type: "resumePeerStream",
          data: {
            sender_uuid: data.sender_uuid,
          },
        });
      } else if (type === "pausePeerStream") {
        const senderParticipant = peerStore.getParticipant(
          body.room_uuid,
          data.sender_uuid
        );
        wsSend(senderParticipant?.socket as WebSocket, {
          type: "pausePeerStream",
          data: {
            sender_uuid: data.sender_uuid,
          },
        });
      } else {
        console.warn("Unhandled message type:", type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  socket.onclose = (event: CloseEvent) => {
    console.log(
      `Socket close. Code: ${event.code} - was clean ${event.wasClean}`
    );
    console.log(`reason: ${event.reason}`);

    if (!peerStore.getRoom(body.room_uuid)) return;

    const participant = peerStore.getParticipant(
      body.room_uuid,
      body.user_uuid
    );
    if (participant) {
      participant.timelines[participant.timelines.length - 1].end_at =
        Date.now();
      peerStore.updateParticipant(body.room_uuid, participant.uuid, {
        status: "left",
        timelines: participant.timelines,
      });
    }

    broadcastToOthers(body.room_uuid, body.user_uuid, {
      type: "userStatus",
      data: { user_uuid: body.user_uuid, status: "left" },
    });

    // TODO: pertimpangkan apakah perlu menghapus participant di ws server jika sudah disconnect?
    // peerStore.removeParticipant(body.room_uuid, body.user_uuid);

    // jika participant yang aktif kosong
    // if (Object.keys(peers[body.room_uuid].participants).length === 0) {
    // TODO: update data ended_at di database
    // broadcastToOthers(body.room_uuid, body.user_uuid, {
    //   type: "closeRoom",
    //   data: {},
    // });
    //    peerStore.removeRoom(body.room_uuid);
    // }
  };

  socket.onerror = (event: ErrorEvent) => {
    console.log(`WS Error: ${event.error}`);
    console.log(`WS Error message: ${event.message}`);
  };

  return response;
};

const middleware: Handler = (rev, next) => {
  if (rev.request.headers.get("upgrade") !== "websocket") {
    throw new HttpError(400, "Protocol not supported");
  }
  rev.body = tryDecode(rev.params.token);
  return next();
};

export const wsHandlers: Handler[] = [middleware, handler];
