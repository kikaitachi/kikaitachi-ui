const MSG_TELEMETRY_DEFINITION = 0;
const MSG_TELEMETRY = 1;

export class ServerConnection {

  /*let connected = false;
  let onConnected;
  let onDisconnected;*/

  constructor(onConnected, onDisconnected) {
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
  }

  connect(url) {
    const socket = new WebSocket(url);
    socket.onopen = (event) => {
      this.connected = true;
      if (this.onConnected) {
        this.onConnected();
      }
      console.log('WebSocket opened');
    };
    socket.onclose = (event) => {
      this.connected = false;
      if (this.onDisconnected) {
        this.onDisconnected();
      }
      console.log('WebSocket closed with code: ' + event.code);
      //setTimeout(function() {connect(onmessage);}, reconnectInMs);
    }
    socket.onerror = (event) => {
      console.log('WebSocket error: ' + event);
    }
    socket.onmessage = (event) => {
      const reader = new FileReader();
    	reader.addEventListener("loadend", () => {
        const data = new DataView(reader.result, 0);
        const msgType = data.getInt8(0);
        console.log('Received message of type ' + msgType);
        if (msgType == MSG_TELEMETRY_DEFINITION) {
          //const channel = data.getInt8(i * 5);
					//const value = data.getFloate32(i * 5 + 1, true);
        } else if (msgType == MSG_TELEMETRY) {
        } else {
          console.log('Unknown message type: ' + msgType);
        }
      });
      reader.readAsArrayBuffer(event.data);
    }
  }
};