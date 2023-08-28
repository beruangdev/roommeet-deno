import PeerStore from "./peersStore.ts";

const peerStore = PeerStore.getInstance();
console.log(peerStore.getRoom("myRoom")); // Baca peers

peerStore.setPeers({ key: "newRoom" }); // Ubah peers