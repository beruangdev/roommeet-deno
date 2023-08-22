// import { iceServers } from "./stunServers.js";

const fork = window;
const meetElement = document.getElementById("meet");
const chatInput = document.getElementById("chatInput");
const chatbox = document.getElementById("chatbox");
const chatMessage = document.getElementById("chatMessage");
const chatForm = document.getElementById("chatForm");
meetElement.style.display = "none";
const token = localStorage.getItem("meet_token");
const isHttps = window.location.href.startsWith("https");
const isDev = window.__DEV__ ?? false;

fork.logout = () => {
  localStorage.removeItem("meet_token");
  setTimeout(() => {
    window.location.href = "./";
  }, 300);
};

fork.openChat = () => {
  chatbox.style.display = "block";
  setTimeout(() => {
    chatInput.focus();
  }, 300);
};

fork.closeChat = () => {
  chatbox.style.display = "none";
};

let ws;
let localStream = null;
let videoEnabled = true;
let audioEnabled = true;

const peers = {};

if (!isDev && !isHttps) {
  window.location.href =
    "https://" + window.location.href.replace("http://", "");
}

const constraints = {
  audio: audioEnabled,
  video: {
    width: {
      max: 100,
    },
    height: {
      max: 100,
    },
    frameRate: { ideal: 24, max: 40 },
  },
};
updateVideoQuality();
function updateVideoQuality(
  context = "1:1",
  downlinkMbps = navigator.connection.downlink
) {
  console.log("updateVideoQuality");
  constraints.audio = audioEnabled;
  switch (context) {
    case "1:1":
      if (downlinkMbps >= 2) {
        constraints.video.width = { ideal: 1920, max: 1920 };
        constraints.video.height = { ideal: 1080, max: 1080 };
        constraints.video.frameRate = { ideal: 30, max: 30 };
      } else if (downlinkMbps >= 1.5) {
        constraints.video.width = { ideal: 1280, max: 1280 };
        constraints.video.height = { ideal: 720, max: 720 };
        constraints.video.frameRate = { ideal: 30, max: 30 };
      } else if (downlinkMbps >= 1) {
        constraints.video.width = { ideal: 640, max: 640 };
        constraints.video.height = { ideal: 360, max: 360 };
        constraints.video.frameRate = { ideal: 20, max: 25 };
      } else if (downlinkMbps >= 0.5) {
        constraints.video.width = { ideal: 480, max: 640 };
        constraints.video.height = { ideal: 270, max: 360 };
        constraints.video.frameRate = { ideal: 15, max: 20 };
      } else if (downlinkMbps >= 0.2) {
        constraints.video.width = { ideal: 320, max: 480 };
        constraints.video.height = { ideal: 180, max: 270 };
        constraints.video.frameRate = { ideal: 15, max: 20 };
      } else {
        constraints.video.width = { ideal: 160, max: 320 };
        constraints.video.height = { ideal: 90, max: 180 };
        constraints.video.frameRate = { ideal: 10, max: 15 };
      }
      break;

    case "group":
      if (downlinkMbps >= 4) {
        constraints.video.width = { ideal: 1920, max: 1920 };
        constraints.video.height = { ideal: 1080, max: 1080 };
      } else if (downlinkMbps >= 3) {
        constraints.video.width = { ideal: 1280, max: 1280 };
        constraints.video.height = { ideal: 720, max: 720 };
      } else if (downlinkMbps >= 1) {
        constraints.video.width = { ideal: 640, max: 640 };
        constraints.video.height = { ideal: 360, max: 360 };
      } else {
        constraints.video.width = { ideal: 480, max: 640 };
        constraints.video.height = { ideal: 270, max: 360 };
      }
      break;

    case "webinar":
      if (downlinkMbps >= 3.5) {
        constraints.video.width = { ideal: 1920, max: 1920 };
        constraints.video.height = { ideal: 1080, max: 1080 };
      } else if (downlinkMbps >= 2) {
        constraints.video.width = { ideal: 1280, max: 1280 };
        constraints.video.height = { ideal: 720, max: 720 };
      } else if (downlinkMbps >= 1) {
        constraints.video.width = { ideal: 640, max: 640 };
        constraints.video.height = { ideal: 360, max: 360 };
      } else if (downlinkMbps >= 0.5) {
        constraints.video.width = { ideal: 480, max: 640 };
        constraints.video.height = { ideal: 270, max: 360 };
      } else {
        constraints.video.width = { ideal: 320, max: 480 };
        constraints.video.height = { ideal: 180, max: 270 };
      }
      break;

    default:
      console.error("Invalid context provided");
      return null;
  }

  console.log("constraints", constraints);
}

navigator.connection &&
  navigator.connection.addEventListener("change", () => {
    console.log("navigator.connection change", navigator.connection.downlink);
    if (videoEnabled) {
      updateVideoQuality();
      refreshStreamWithNewConstraints();
    }
  });

function refreshStreamWithNewConstraints() {
  console.log("refreshStreamWithNewConstraints");

  if (localStream) {
    const tracks = localStream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    localVideo.srcObject = null;
  }
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    for (const user_id in peers) {
      for (const index in peers[user_id].streams[0].getTracks()) {
        for (const index2 in stream.getTracks()) {
          if (
            peers[user_id].streams[0].getTracks()[index].kind ===
            stream.getTracks()[index2].kind
          ) {
            peers[user_id].replaceTrack(
              peers[user_id].streams[0].getTracks()[index],
              stream.getTracks()[index2],
              peers[user_id].streams[0]
            );
            break;
          }
        }
      }
    }
    localStream = stream;
    localVideo.srcObject = stream;
    updateButtons();
  });
}

constraints.video.facingMode = {
  ideal: "user",
};
let info = {};
function init(token, stream) {
  const protoWs = isHttps ? "wss" : "ws";
  ws = new WebSocket(protoWs + "://" + window.location.host + "/ws/" + token);
  ws.onclose = () => {
    for (const user_id in peers) {
      removePeer(user_id);
    }
  };
  ws.onmessage = async (e) => {
    const { type, data } = JSON.parse(e.data);
    if (type === "initReceive") {
      await addPeer(data.user_id, false);
      ws.send(
        JSON.stringify({
          type: "initSend",
          data,
        })
      );
    } else if (type === "opening") {
      localVideo.srcObject = stream;
      localStream = stream;
      info = data;
      document.getElementById("settings").style.display = "inline-block";
      document.getElementById("me").innerHTML = `Me: ${info.user_id}`;
    } else if (type === "initSend") addPeer(data.user_id, true);
    else if (type === "removePeer") removePeer(data.user_id);
    else if (type === "signal") peers[data.user_id].signal(data.signal);
    else if (type === "full") alert("Room FULL");
    else if (type === "errorToken") fork.logout();
    else if (type === "errorPassword") fork.logout();
    else if (type === "closeRoom") fork.logout();
    else if (type === "toggleVideo") {
      const opacity = data.videoEnabled ? 1 : 0;
      document.querySelector(`video[id="${data.user_id}"]`).style.opacity =
        opacity;
    } else if (type === "toggleMute") {
      console.log(`${data.user_id} mute sound`);
      // const opacity = data.videoEnabled ? 1 : 0
      // document.querySelector(`video[id="${data.user_id}"]`).style.opacity = opacity
    } else if (type === "chat") {
      chatMessage.innerHTML += `
        <div class="chat-message">
          <b>${data.user_id.split("@")[0]}: </b>${data.message}
        </div>
      `;
      fork.openChat();
    }
  };
}
function removePeer(user_id) {
  const videoEl = document.getElementById(user_id);
  const colEl = document.getElementById("col-" + user_id);
  if (colEl && videoEl) {
    const tracks = videoEl.srcObject.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    videoEl.srcObject = null;
    videos.removeChild(colEl);
  }
  if (peers[user_id]) peers[user_id].destroy();

  document.querySelector(`[data-user_id="${user_id}"]`).remove();
  delete peers[user_id];
}
async function addPeer(user_id, am_initiator) {
  const iceServers = await getIceServers();
  const configuration = {
    iceServers: iceServers,
  };

  peers[user_id] = new SimplePeer({
    initiator: am_initiator,
    stream: localStream,
    config: configuration,
  });

  peers[user_id].on("signal", (data) => {
    ws.send(
      JSON.stringify({
        type: "signal",
        data: {
          signal: data,
          user_id,
        },
      })
    );
  });

  peers[user_id].on("stream", (stream) => {
    // col
    const col = document.createElement("col");
    col.user_id = "col-" + user_id;
    col.className = "container";
    col.setAttribute("data-user_id", user_id);

    // video
    const newVid = document.createElement("video");
    newVid.srcObject = stream;
    newVid.user_id = user_id;
    newVid.playsinline = false;
    newVid.autoplay = true;
    newVid.className = "vid";
    newVid.setAttribute("id", user_id);

    newVid.onclick = () => openPictureMode(newVid, user_id);
    newVid.ontouchstart = () => openPictureMode(newVid, user_id);

    // user
    const user = document.createElement("div");
    user.className = "overlay-text";
    user.innerHTML = user_id;
    col.append(newVid, user);
    videos.appendChild(col);
  });
}
function openPictureMode(el, user_id) {
  el.requestPictureInPicture();
  el.onleavepictureinpicture = () => {
    setTimeout(() => {
      document.getElementById(user_id).play();
    }, 300);
  };
}

fork.switchMedia = () => {
  if (constraints.video.facingMode.ideal === "user") {
    constraints.video.facingMode.ideal = "environment";
  } else {
    constraints.video.facingMode.ideal = "user";
  }
  const tracks = localStream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
  localVideo.srcObject = null;
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    for (const user_id in peers) {
      for (const index in peers[user_id].streams[0].getTracks()) {
        for (const index2 in stream.getTracks()) {
          if (
            peers[user_id].streams[0].getTracks()[index].kind ===
            stream.getTracks()[index2].kind
          ) {
            peers[user_id].replaceTrack(
              peers[user_id].streams[0].getTracks()[index],
              stream.getTracks()[index2],
              peers[user_id].streams[0]
            );
            break;
          }
        }
      }
    }
    localStream = stream;
    localVideo.srcObject = stream;
    updateButtons();
  });
};

fork.shareScreen = () => {
  navigator.mediaDevices.getDisplayMedia().then((stream) => {
    for (const user_id in peers) {
      for (const index in peers[user_id].streams[0].getTracks()) {
        for (const index2 in stream.getTracks()) {
          if (
            peers[user_id].streams[0].getTracks()[index].kind ===
            stream.getTracks()[index2].kind
          ) {
            peers[user_id].replaceTrack(
              peers[user_id].streams[0].getTracks()[index],
              stream.getTracks()[index2],
              peers[user_id].streams[0]
            );
            break;
          }
        }
      }
    }
    localStream = stream;
    localVideo.srcObject = localStream;
    updateButtons();
    stream.getVideoTracks()[0].onended = function () {
      fork.switchMedia();
      addPeer(info.user_id, false);
    };
  });
};

fork.removeLocalStream = () => {
  if (localStream) {
    const tracks = localStream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    localVideo.srcObject = null;
  }

  for (const user_id in peers) {
    removePeer(user_id);
  }
};

fork.toggleMute = () => {
  for (const index in localStream.getAudioTracks()) {
    localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled;

    audioEnabled = localStream.getAudioTracks()[index].enabled;
      updateVideoQuality()
      if (!audioEnabled) {
      // Jika audio sedang diaktifkan, hentikan track
      // localStream.getAudioTracks()[index].stop();
      localStream.getAudioTracks()[index].applyConstraints(constraints).then((audioStream) => {
        muteButton.innerText = "Muted";
        //     const audioTrack = audioStream.getAudioTracks()[0];
        // localStream.addTrack(audioStream);
      })
    } else {
      // localStream.getAudioTracks()[index].applyConstraints(constraints).then((audioStream) => {
      //     muteButton.innerText = "Unmuted";
      //     //     const audioTrack = audioStream.getAudioTracks()[0];
      //     // localStream.addTrack(audioStream);
      // })
      // refreshStreamWithNewConstraints()
      // Jika audio sedang dimatikan, aktifkan kembali
      // navigator.mediaDevices
      //   .getUserMedia({audio: true})
      //   .then(function (audioStream) {
      //     const audioTrack = audioStream.getAudioTracks()[0];
      //     localStream.addTrack(audioTrack);
      // muteButton.innerText = "Unmuted";
      //   });
      muteButton.innerText = "Unmuted";
    }

    ws.send(
      JSON.stringify({
        type: "toggleMute",
        data: {
          soundEnabled: localStream.getAudioTracks()[index].enabled,
        },
      })
    );
  }
};

fork.toggleVid = () => {
  for (const index in localStream.getVideoTracks()) {
    localStream.getVideoTracks()[index].enabled =
      !localStream.getVideoTracks()[index].enabled;

    videoEnabled = localStream.getVideoTracks()[index].enabled; // Simpan status video saat tombol ditekan
    vidButton.innerText = videoEnabled ? "Video Enabled" : "Video Disabled";

    ws.send(
      JSON.stringify({
        type: "toggleVideo",
        data: {
          videoEnabled,
        },
      })
    );

    if (!videoEnabled) {
      // Hentikan streaming gambar dari perangkat
      localStream.getVideoTracks()[index].stop();
      localVideo.srcObject = null;
    } else {
      // Mulai streaming gambar dari perangkat kembali
      updateVideoQuality();
      refreshStreamWithNewConstraints();
      // navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      //   for (const user_id in peers) {
      //     for (const index in peers[user_id].streams[0].getTracks()) {
      //       for (const index2 in stream.getTracks()) {
      //         if (
      //           peers[user_id].streams[0].getTracks()[index].kind ===
      //           stream.getTracks()[index2].kind
      //         ) {
      //           peers[user_id].replaceTrack(
      //             peers[user_id].streams[0].getTracks()[index],
      //             stream.getTracks()[index2],
      //             peers[user_id].streams[0]
      //           );
      //           break;
      //         }
      //       }
      //     }
      //   }
      //   localStream = stream;
      //   localVideo.srcObject = stream;
      //   updateButtons();
      // });
    }
  }
};

function updateButtons() {
  for (const index in localStream.getVideoTracks()) {
    vidButton.innerText = localStream.getVideoTracks()[index].enabled
      ? "Video Enabled"
      : "Video Disabled";
  }
  for (const index in localStream.getAudioTracks()) {
    muteButton.innerText = localStream.getAudioTracks()[index].enabled
      ? "Unmuted"
      : "Muted";
  }
}

fork.inviteFriend = () => {
  const url = window.location.origin + "/?invite=" + info.room;
  const input = document.createElement("input");
  input.setAttribute("value", url);
  document.body.appendChild(input);
  input.select();
  const result = document.execCommand("copy");
  document.body.removeChild(input);
  if (result) {
    alert("Link was copied to clipboard");
  }
};
chatForm.onsubmit = (e) => {
  e.preventDefault();
  if (!chatInput.value) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: "chat",
      data: { user_id: info.user_id, message: chatInput.value },
    })
  );
  chatMessage.innerHTML += `
    <div class="chat-message">
      <b>Me: </b>${chatInput.value}
    </div>
  `;
  chatInput.value = "";
  chatMessage.scrollTop = chatMessage.scrollHeight;
};

if (token) {
  meetElement.style.display = "block";
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      init(token, stream);
    })
    .catch(function (err) {
      alert(`getusermedia error ${err.name}`);
    });
} else {
  window.location.href = "./";
}
