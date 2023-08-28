// room.controller.ts
import { BodyProp } from "./data-types.ts";
import { Handler, HttpError } from "./deps.ts";
import { strToDate } from "./helper/date.ts";
import PeerStore from "./peersStore.ts";
import {
  generateToken,
  MAX_USER,
  updateRoomActivity,
  validateBody,
} from "./ws-libs.ts";

const peerStore = PeerStore.getInstance();

export const joinOrCreateRoom: Handler<{
  body: BodyProp;
}> = (rev) => {
  const { body } = rev;
  console.log("🚀 ~ file: room.controller.ts:19 ~ body:", body);
  validateBody(body);
  updateRoomActivity(body.room_uuid);

  let room = peerStore.getRoom(body.room_uuid);
  // jika room tidak ada buatkan room baru
  if (!room) {
    room = peerStore.addRoom(body.room_uuid, {
      uuid: body.room_uuid,
      name: body.room_name,
      creator_uuid: body.creator_uuid,
      password: body.password || undefined,
      video_enabled: Boolean(body.video_enabled),
      audio_enabled: Boolean(body.audio_enabled),
      participant_timeline_enabled: Boolean(body.participant_timeline_enabled),
      cam_timeline_enabled: Boolean(body.cam_timeline_enabled),
      face_timeline_enabled: Boolean(body.face_timeline_enabled),
      lobby_enabled: Boolean(body.lobby_enabled),

      started_at: strToDate(body.started_at),
      ended_at: null,

      participants: {
        [body.user_uuid]: {
          socket: null,
          status: "offline",
          uuid: body.user_uuid,
          name: body.user_name,
          approved: true,
          is_creator: true,
          video_enabled: body.video_enabled || false,
          audio_enabled: body.audio_enabled || false,

          timelines: [],
          cam_timelines: [],
          face_timelines: [],
          created_at: Date.now(),
        },
      },
      chats: [],

      created_at: Date.now(),
      last_active_at: Date.now(),
    });
  }

  let participant = peerStore.getParticipant(
    body.room_uuid,
    body.user_uuid,
  );

  if (!participant) {
    participant = peerStore.addParticipant(
      body.room_uuid,
      {
        uuid: body.user_uuid,
        name: body.user_name,
        approved: true,
        is_creator: false,
        video_enabled: Boolean(body.video_enabled),
        audio_enabled: Boolean(body.audio_enabled),
        socket: null,
        status: "offline",
        created_at: Date.now(),
        timelines: [],
        cam_timelines: [],
        face_timelines: [],
      },
    );
  }

  room = peerStore.getRoom(body.room_uuid);
  if (room && Object.keys(room.participants).length >= MAX_USER) {
    throw new HttpError(
      400,
      `RoomProp [${body.room_uuid}] ${body.room_name} full`,
    );
  }

  return {
    token: generateToken({
      room_uuid: body.room_uuid,
      user_uuid: body.user_uuid,
      password: body.password,
    }),
  };
};

export const getPeers = () => {
  return peerStore.getPeers();
};

export const resetPeers = () => {
  return peerStore.resetPeers();
};

export const getRoom: Handler = (rev) => {
  return peerStore.getRoom(rev.params.room_uuid) ?? {};
};
