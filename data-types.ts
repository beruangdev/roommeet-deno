export type BodyProp = {
  user_uuid: string;
  user_name: string;
  room_uuid: string;
  room_name: string;
  password?: string;
  approved: boolean;
  creator_uuid: string;
  is_creator: boolean;
  video_enabled: boolean;
  audio_enabled: boolean;
  participant_timeline_enabled: boolean;
  cam_timeline_enabled: boolean;
  face_timeline_enabled: boolean;
  lobby_enabled: boolean;
  started_at: string;
};

export type TokenDataProp = {
  room_uuid: string;
  user_uuid: string;
  password?: string | undefined;
}

export type WsMessageProp =
  | { type: "opening"; data: { room_uuid: string; user_uuid: string, myy: ParticipantProp | undefined } }
  | { type: "initReceive"; data: { user_uuid: string } }
  | { type: "initSend"; data: { user_uuid: string } }
  | { type: "signal"; data: { user_uuid: string; signal: unknown } }
  | {
      type: "userStatus";
      data: { user_uuid: string; status: "in_room" | "in_lobby" | "left" };
    }
  | { type: "toggleVideo"; data: { user_uuid: string; video_enabled: boolean } }
  | { type: "toggleAudio"; data: { user_uuid: string; audio_enabled: boolean } }
  | { type: "errorToken"; data: Record<string | number | symbol, never> }
  | { type: "errorPassword"; data: Record<string | number | symbol, never> }
  | { type: "full"; data: Record<string | number | symbol, never> }
  | { type: "chat"; data: { user_uuid: string; message: string } };

export type RoomProp = {
  uuid: string;
  name: string;
  creator_uuid: string;
  password?: string;
  video_enabled: boolean;
  audio_enabled: boolean;
  participant_timeline_enabled: boolean;
  cam_timeline_enabled: boolean;
  face_timeline_enabled: boolean;
  lobby_enabled: boolean;
  started_at: number;
  ended_at: number | null;

  participants: Record<string, ParticipantProp>;
  chats: { user_uuid: string; message: string }[];
  
  last_active_at: number;
  updated_at?: number;
  created_at: number;
};

export type ParticipantProp = {
  uuid: string;
  name: string;
  approved: boolean;
  is_creator: boolean;
  video_enabled: boolean;
  audio_enabled: boolean;
  socket: WebSocket | null;
  status: "in_room" | "in_lobby" | "left";
  timelines: {
    start_at: number;
    end_at?: number;
  }[];
  cam_timelines: [];
  face_timelines: [];
  updated_at?: number;
  created_at: number;
};
