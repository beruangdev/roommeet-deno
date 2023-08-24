export type User = {
  user_id: string;
  room: string;
  password?: string;
  videoEnabled: boolean;
  soundEnabled: boolean;
  trackParticipantTimelineEnabled: boolean;
  trackParticipantCamTimelineEnabled: boolean;
  trackParticipantFaceTimelineEnabled: boolean;
  lobbyEnabled: boolean;
}

export type WsMessage =
  | { type: "errorToken"; data: Record<string | number | symbol, never> }
  | { type: "errorPassword"; data: Record<string | number | symbol, never> }
  | { type: "full"; data: Record<string | number | symbol, never> }
  | { type: "opening"; data: { room: string; user_id: string } }
  | {
    type: "userStatus";
    data: { user_id: string; status: "online" | "offline" };
  }
  | { type: "initReceive"; data: { user_id: string } }
  | { type: "signal"; data: { user_id: string; signal: unknown } }
  | { type: "initSend"; data: { user_id: string } }
  | { type: "chat"; data: { user_id: string; message: string } }
  | { type: "toggleVideo"; data: { user_id: string; videoEnabled: boolean } }
  | { type: "toggleSound"; data: { user_id: string; soundEnabled: boolean } };

export type ParticipantData = {
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
  chats: { user_id: string; message: string }[];
  password?: string;
  lastActiveAt: number;
  videoEnabled: boolean;
  soundEnabled: boolean;
  trackParticipantTimelineEnabled: boolean;
  trackParticipantCamTimelineEnabled: boolean;
  trackParticipantFaceTimelineEnabled: boolean;
  lobbyEnabled: boolean;
  createdAt: number;
}
