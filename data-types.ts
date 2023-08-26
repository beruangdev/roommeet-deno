export type User = {
  user_uuid: string;
  room: string;
  password?: string;
  videoEnabled: boolean;
  soundEnabled: boolean;
  trackParticipantTimelineEnabled: boolean;
  trackParticipantCamTimelineEnabled: boolean;
  trackParticipantFaceTimelineEnabled: boolean;
  lobbyEnabled: boolean;
};

export type WsMessage =
  | { type: "errorToken"; data: Record<string | number | symbol, never> }
  | { type: "errorPassword"; data: Record<string | number | symbol, never> }
  | { type: "full"; data: Record<string | number | symbol, never> }
  | { type: "opening"; data: { room: string; user_uuid: string } }
  | {
      type: "userStatus";
      data: { user_uuid: string; status: "online" | "offline" };
    }
  | { type: "initReceive"; data: { user_uuid: string } }
  | { type: "signal"; data: { user_uuid: string; signal: unknown } }
  | { type: "initSend"; data: { user_uuid: string } }
  | { type: "chat"; data: { user_uuid: string; message: string } }
  | { type: "toggleVideo"; data: { user_uuid: string; videoEnabled: boolean } }
  | { type: "toggleAudio"; data: { user_uuid: string; audioEnabled: boolean } };

export type ParticipantData = {
  uuid: string;
  name: string;
  approved: boolean;
  creator: boolean;
  // camTimeline: [];
  // faceTimeline: [];
  soundEnabled: boolean;
  videoEnabled: boolean;
  socket: WebSocket | null;
  status: "online" | "offline";
  sessions: {
    startTime: number;
    endTime?: number;
  }[];
};

export type Room = {
  creator: string;
  participants: Record<string, ParticipantData>;
  chats: { user_uuid: string; message: string }[];
  password?: string;
  lastActiveAt: number;
  videoEnabled: boolean;
  soundEnabled: boolean;
  trackParticipantTimelineEnabled: boolean;
  trackParticipantCamTimelineEnabled: boolean;
  trackParticipantFaceTimelineEnabled: boolean;
  lobbyEnabled: boolean;
  createdAt: number;
};
