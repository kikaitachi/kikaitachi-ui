import { ServerConnection } from "/ServerConnection.js";
import { Telemetry } from "/Telemetry.js";
import { Map3D } from "/Map3D.js";
import { MessageIn, MessageOut } from "/Message.js";

const map3d = new Map3D();

const MSG_TELEMETRY_ADD = 0;
const MSG_TELEMETRY_UPDATE = 1;
const MSG_TELEMETRY_DELETE = 2;
const MSG_TELEMETRY_QUERY = 3;

let timer;

const robotUrl = document.getElementById('robotUrl');
if (window.location.hostname == 'localhost') {
  robotUrl.innerHTML = 'ws://localhost:3001';
} else {
  robotUrl.innerHTML = 'ws://naminukas-demo.herokuapp.com:80';
}
robotUrl.spellcheck = false;
robotUrl.focus();

function sendCommand(id, value) {
  const msg = new MessageOut();
  msg.writeSignedInt(MSG_TELEMETRY_UPDATE);
  msg.writeSignedInt(id);
  msg.writeSignedInt(value);
  console.log("Send value: " + value);
  serverConnection.send(msg);
}

const connectButton = document.getElementById('connectButton');
const telemetry = new Telemetry(map3d, sendCommand);
const serverConnection = new ServerConnection(
  (socket) => {
    connectButton.innerHTML = 'Disconnect';
    telemetry.clearItems();
    timer = setInterval(() => {
      const msg = new MessageOut();
      msg.writeSignedInt(MSG_TELEMETRY_QUERY);
      socket.send(msg.getBuffer());
    }, 500);
  },
  () => {
    connectButton.innerHTML = 'Connect';
    clearInterval(timer);
  },
  (dataView) => {
    const msg = new MessageIn(dataView);
    const msgType = msg.readSignedInt();
    if (msgType == MSG_TELEMETRY_ADD) {
      telemetry.addItem(msg);
    } else if (msgType == MSG_TELEMETRY_UPDATE) {
      telemetry.updateItem(msg);
    } else {
      console.log('Unknown message type: ' + msgType);
    }
  }
);

const toggleConnection = () => {
  if (!serverConnection.isConnected()) {
    connectButton.innerHTML = "Connecting...";
    serverConnection.connect(robotUrl.innerHTML);
  } else {
    serverConnection.disconnect();
  }
}

connectButton.onclick = toggleConnection;

robotUrl.onkeydown = (event) => {
  if (event.code == 'Enter' || event.code == 'NumpadEnter') {
    event.preventDefault();
    toggleConnection();
  }
};


