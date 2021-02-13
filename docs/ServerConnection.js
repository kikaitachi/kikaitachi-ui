export class ServerConnection {

  #socket = null;

  constructor(onConnected, onDisconnected, onMessage) {
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onMessage = onMessage;
  }

  isConnected() {
    return this.#socket != null;
  }

  connect(url) {
    this.#socket = new WebSocket(url);
    this.#socket.onopen = (event) => {
      if (this.onConnected) {
        this.onConnected(this.#socket);
      }
      console.log('WebSocket opened');
    };
    this.#socket.onclose = (event) => {
      this.#socket = null;
      console.log('WebSocket closed with code ' + event.code + ' and reason: ' + event.reason);
      if (this.onDisconnected) {
        this.onDisconnected();
      }
    }
    this.#socket.onerror = (event) => {
      console.log('WebSocket error: ' + event);
    }
    this.#socket.onmessage = async (event) => {
      const buffer = await event.data.arrayBuffer();
      this.onMessage(new DataView(buffer));
    }
  }

  send(msg) {
    if (this.#socket != null) {
      this.#socket.send(msg.getBuffer());
    }
  }

  disconnect() {
    if (this.#socket != null) {
      this.#socket.close();
    }
  }
};
