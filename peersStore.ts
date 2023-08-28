// peersStore.ts
import { ParticipantProp, RoomProp } from "./data-types.ts";

class PeerStore {
  private static instance: PeerStore;
  private peers: Record<string, RoomProp> = {};
  private readonly logEnabled: boolean = true; // Change to false to disable logs.
  private readonly maxRoomNotActive = 5;
  private readonly maxRoomLife = 7;

  private constructor() {
    setInterval(() => this.cleanupRooms(), 60 * 60 * 1000);
  }

  public static getInstance(): PeerStore {
    if (!PeerStore.instance) {
      PeerStore.instance = new PeerStore();
    }
    return PeerStore.instance;
  }

  private log(message: string): void {
    if (this.logEnabled) {
      console.log(`[PeerStore] ${message}`);
    }
  }

  getPeers(): Record<string, RoomProp> {
    return this.peers;
  }

  resetPeers(): Record<string, RoomProp> {
    this.peers = {};
    return this.peers;
  }

  cleanupRooms(): void {
    const currentTimestamp = Date.now();
    const day = 24 * 60 * 60 * 1000;
    for (const room_uuid in this.peers) {
      const room: RoomProp = this.peers[room_uuid];
      if (
        room.updated_at &&
        currentTimestamp - room.updated_at > day * this.maxRoomNotActive
      ) {
        this.removeRoom(room_uuid);
        this.log(
          `Room dengan kunci ${room_uuid} dihapus karena tidak aktif selama ${this.maxRoomNotActive} hari`,
        );
        continue;
      }

      if (
        room.created_at &&
        currentTimestamp - room.created_at > day * this.maxRoomLife
      ) {
        this.removeRoom(room_uuid);
        this.log(
          `Room dengan kunci ${room_uuid} dihapus karena telah dibuat sejak ${this.maxRoomLife} hari yang lalu`,
        );
      }
    }
  }
  // Operasi CRUD untuk Room
  addRoom(room_uuid: string, room: RoomProp): RoomProp {
    this.log(`Menambahkan room dengan kunci ${room_uuid}`);
    const now = Date.now();
    this.peers = {
      ...this.peers,
      [room_uuid]: { ...room, created_at: now, updated_at: now },
    };
    return this.peers[room_uuid];
  }

  updateRoom(room_uuid: string, updatedRoom: Partial<RoomProp>): RoomProp {
    if (this.peers[room_uuid]) {
      this.log(`Memperbarui room dengan kunci ${room_uuid}`);
      this.peers = {
        ...this.peers,
        [room_uuid]: {
          ...this.peers[room_uuid],
          ...updatedRoom,
          updated_at: Date.now(),
        },
      };
    } else {
      throw new Error("Room tidak ditemukan");
    }
    return this.peers[room_uuid];
  }

  removeRoom(room_uuid: string): void {
    this.log(`Menghapus room dengan kunci ${room_uuid}`);
    const { [room_uuid]: _, ...rest } = this.peers;
    this.peers = { ...rest };
  }

  getRoom(room_uuid: string): RoomProp | undefined {
    this.log(`Mengambil room dengan kunci ${room_uuid}`);
    return this.peers[room_uuid];
  }

  // Operasi CRUD untuk Participant

  getParticipant(
    room_uuid: string,
    participant_uuid: string,
  ): ParticipantProp | undefined {
    this.log(`Mengambil participant dari room ${room_uuid}`);
    return this.peers[room_uuid]?.participants[participant_uuid];
  }

  addParticipant(
    room_uuid: string,
    participant: ParticipantProp,
  ): ParticipantProp {
    if (this.peers[room_uuid]) {
      this.log(`Menambahkan participant pada room ${room_uuid}`);
      const now = Date.now();
      this.peers = {
        ...this.peers,
        [room_uuid]: {
          ...this.peers[room_uuid],
          participants: {
            ...this.peers[room_uuid].participants,
            [participant.uuid]: {
              ...participant,
              created_at: now,
              updated_at: now,
            },
          },
        },
      };
    } else {
      throw new Error("Room tidak ditemukan");
    }

    return this.peers[room_uuid].participants[participant.uuid];
  }

  updateParticipant(
    room_uuid: string,
    participant_uuid: string,
    updatedParticipant: Partial<ParticipantProp>,
  ): ParticipantProp {
    if (this.peers[room_uuid]?.participants[participant_uuid]) {
      this.log(`Memperbarui participant pada room ${room_uuid}`);
      const updatedParticipants = {
        ...this.peers[room_uuid].participants,
        [participant_uuid]: {
          ...this.peers[room_uuid].participants[participant_uuid],
          ...updatedParticipant,
          updated_at: Date.now(),
        },
      };
      this.peers = {
        ...this.peers,
        [room_uuid]: {
          ...this.peers[room_uuid],
          participants: updatedParticipants,
        },
      };
    } else {
      throw new Error("Room atau participant tidak ditemukan");
    }
    return this.peers[room_uuid].participants[participant_uuid];
  }

  removeParticipant(room_uuid: string, participant_uuid: string): void {
    this.log(`Menghapus participant dari room ${room_uuid}`);
    if (
      this.peers[room_uuid] &&
      this.peers[room_uuid].participants[participant_uuid]
    ) {
      const { [participant_uuid]: _, ...remainingParticipants } =
        this.peers[room_uuid].participants;
      this.peers = {
        ...this.peers,
        [room_uuid]: {
          ...this.peers[room_uuid],
          participants: remainingParticipants,
        },
      };
    } else {
      throw new Error("Room tidak ditemukan");
    }
  }
}

export default PeerStore;
