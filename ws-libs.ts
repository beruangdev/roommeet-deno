type ParticipantData = {
  socket: WebSocket;
  status: "online" | "offline";
  sessions: {
    startTime: number;
    endTime?: number;
  }[];
};

/*
Untuk menghitung total waktu yang dihabiskan oleh pengguna, Anda dapat menambahkan seluruh durasi dari semua sesi:
*/
function _getTotalTime(participant: ParticipantData): number {
  return participant.sessions.reduce((total, session) => {
    const end = session.endTime || Date.now();  // Jika sesi belum berakhir, gunakan waktu saat ini
    return total + (end - session.startTime);
  }, 0);
}

// Anda juga dapat membuat fungsi untuk mendapatkan timeline dari sesi pengguna:
function _getTimeline(participant: ParticipantData): { start: number; end?: number }[] {
  return participant.sessions.map(session => ({
    start: session.startTime,
    end: session.endTime,
  }));
}