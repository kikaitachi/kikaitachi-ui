const MSG_TELEMETRY_DEFINITION: number = 0;
const MSG_TELEMETRY: number = 1;

export class ServerConnection {

  connected: boolean = false;
  onConnected: () => void;
  onDisconnected: () => void;

  constructor(onConnected: () => void, onDisconnected: () => void) {
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
  }

  connect(url: string) {
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
      const reader: FileReader = new FileReader();
    	reader.addEventListener("loadend", () => {
        const bytes: Uint8Array = new Uint8Array(reader.result);
        const data: DataView = new DataView(reader.result, 1);
        if (bytes[0] == MSG_TELEMETRY_DEFINITION) {
          //const channel = data.getInt8(i * 5);
					//const value = data.getFloate32(i * 5 + 1, true);
        } else if (bytes[0] == MSG_TELEMETRY_DEFINITION) {
        } else {
          console.log('Unknown message type: ' + bytes[0]);
        }
      });
      reader.readAsArrayBuffer(event.data);
    }
  }
};
