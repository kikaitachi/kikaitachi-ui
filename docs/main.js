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

const params = new URLSearchParams(document.location.search.substring(1));
const robotUrl = params.get("u");
const robotUrlElement = document.getElementById('robotUrl');
if (robotUrl) {
  robotUrlElement.innerHTML = robotUrl;
} else if (window.location.hostname == 'localhost') {
  robotUrlElement.innerHTML = 'ws://localhost:3001';
} else {
  robotUrlElement.innerHTML = 'ws://naminukas-demo.herokuapp.com:80';
  robotUrlElement.focus();
}
robotUrlElement.spellcheck = false;

function sendCommand(id, value, modifiers) {
  const msg = new MessageOut();
  msg.writeSignedInt(MSG_TELEMETRY_UPDATE);
  msg.writeSignedInt(id);
  msg.writeSignedInt(value);
  if (modifiers) {
    modifiers.forEach(modifier => {
      msg.writeString(modifier);
    });
  }
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
    const msgType = msg.readUnsignedInt();
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
    window.location.href = window.location.protocol + '//' + window.location.host + '?u=' + robotUrlElement.innerHTML;
  } else {
    serverConnection.disconnect();
  }
}

connectButton.onclick = toggleConnection;

robotUrlElement.onkeydown = (event) => {
  if (event.code == 'Enter' || event.code == 'NumpadEnter') {
    event.preventDefault();
    toggleConnection();
  }
};

if (robotUrl) {
  serverConnection.connect(robotUrl);
}
