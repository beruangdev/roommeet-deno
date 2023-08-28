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
  validateBody(body);
  updateRoomActivity(body.room_uuid);

  let room = peerStore.getRoom(body.room_uuid);
  // jika room tidak ada buatkan room baru
  if (!room) {
    peerStore.addRoom(body.room_uuid, {
      uuid: body.room_uuid,
      name: body.room_name,
      creator_uuid: body.creator_uuid,
      password: body.password || undefined,
      video_enabled: Boolean(body.video_enabled),
      sound_enabled: Boolean(body.sound_enabled),
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
          sound_enabled: body.sound_enabled || false,

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

    room = peerStore.getRoom(body.room_uuid);
  }

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
  // Consider adding a method in PeerStore to return all peers if required.
  return {};
};

export const resetPeers = () => {
  // Add logic in PeerStore to reset if required.
  return {};
};

export const getRoom: Handler = (rev) => {
  return peerStore.getRoom(rev.params.room_uuid) ?? {};
};
