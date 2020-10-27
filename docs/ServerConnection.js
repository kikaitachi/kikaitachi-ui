export class ServerConnection {

  constructor(onConnected, onDisconnected, onMessage) {
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onMessage = onMessage;
  }

  connect(url) {
    const socket = new WebSocket(url);
    socket.onopen = (event) => {
      this.connected = true;
      if (this.onConnected) {
        this.onConnected(socket);
      }
      console.log('WebSocket opened');
    };
    socket.onclose = (event) => {
      this.connected = false;
      console.log('WebSocket closed with code: ' + event.code);
      if (this.onDisconnected) {
        this.onDisconnected();
      }
    }
    socket.onerror = (event) => {
      console.log('WebSocket error: ' + event);
    }
    socket.onmessage = (event) => {
      const reader = new FileReader();
    	reader.addEventListener("loadend", () => {
        this.onMessage(new DataView(reader.result, 0));
      });
      reader.readAsArrayBuffer(event.data);
    }
  }
};
