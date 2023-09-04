// rafactor kode fungsi handler, dan tulis dengan lengkap !!!
// ws.controller.ts
import { ParticipantProp, TokenDataProp, WsMessageProp } from "./data-types.ts";
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

  let room = peerStore.getRoom(body.room_uuid);
  let participant = peerStore.getParticipant(body.room_uuid, body.user_uuid);
  socket.onopen = () => {
    try {
      updateRoomActivity(body.room_uuid);
      validateRoomAccess(body, socket);

      if (participant) {
        participant.socket = socket;
        participant.status = "in_room";
        participant.timelines.push({ start_at: Date.now() });
        participant = peerStore.updateParticipant(
          body.room_uuid,
          participant.uuid,
          participant
        );
      }
      
      wsSend(socket, {
        type: "opening",
        data: {
          room_uuid: body.room_uuid,
          user_uuid: body.user_uuid,
          ...room,
          myy: peerStore.getParticipant(body.room_uuid, body.user_uuid),
        },
      });



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

  socket.onmessage = (event) => {
    try {
      const { type, data } = JSON.parse(event.data) as WsMessageProp;

      if (!peerStore.getRoom(body.room_uuid)) {
        throw new HttpError(404, `Room ${body.room_uuid} not found`);
      }

      const room = peerStore.getRoom(body.room_uuid);

      updateRoomActivity(body.room_uuid);

      if (type === "signal") {
        const participant = peerStore.getParticipant(
          body.room_uuid,
          data.user_uuid
        );
        if (participant) {
          wsSend(participant.socket as WebSocket, {
            type: "signal",
            data: { user_uuid: body.user_uuid, signal: data.signal },
          });
        }
      } else if (type === "initSend") {
        const participant = peerStore.getParticipant(
          body.room_uuid,
          data.user_uuid
        );
        if (participant) {
          wsSend(participant.socket as WebSocket, {
            type: "initSend",
            data: {
              user_uuid: body.user_uuid,
              ...peerStore.getParticipant(body.room_uuid, body.user_uuid),
            },
          });
        }
      } else if (type === "chat") {
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: "chat",
          data: { user_uuid: body.user_uuid, message: data.message },
        });
      } else if (type === "toggleVideo") {
        const updatedData = { video_enabled: data.video_enabled };
        participant = peerStore.updateParticipant(
          body.room_uuid,
          data.user_uuid,
          updatedData
        );
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: type,
          data: {
            user_uuid: data.user_uuid,
            ...updatedData,
          },
        });
      } else if (type === "toggleAudio") {
        const updatedData = { audio_enabled: data.audio_enabled };
        participant = peerStore.updateParticipant(
          body.room_uuid,
          data.user_uuid,
          updatedData
        );
        broadcastToOthers(body.room_uuid, body.user_uuid, {
          type: type,
          data: {
            user_uuid: data.user_uuid,
            ...updatedData,
          },
        });
      } else if (
        type === "requestResumePeerStream" ||
        type === "requestPausePeerStream"
      ) {
        if (room) {
          const sender = peerStore.getParticipant(room.uuid, data.sender_uuid);
          if (sender) {
            wsSend(sender.socket, {
              type: type,
              data: {
                sender_uuid: data.sender_uuid,
                receiver_uuid: data.receiver_uuid,
              },
            });
          }
        }
      } else {
        console.warn("Unhandled message type:", type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  socket.onclose = () => {
    if (!peerStore.getRoom(body.room_uuid)) return;

    if (participant) {
      participant.timelines[participant.timelines.length - 1].end_at =
        Date.now();
      participant = peerStore.updateParticipant(
        body.room_uuid,
        participant.uuid,
        {
          status: "left",
          timelines: participant.timelines,
        }
      );
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
    //    peerStore.removeRoom(body.room_uuid);
    // }
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
