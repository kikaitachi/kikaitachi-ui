export class ServerConnection {

  #socket = null;
  #pendingMessages = new Set();

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
    this.#socket.onmessage = (event) => {
      const message = event.data.arrayBuffer();
      this.#pendingMessages.add(message);
      Promise.all(this.#pendingMessages).then((values) => {
        this.#pendingMessages.delete(message);
        this.onMessage(new DataView(values[values.length - 1]));
      });
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
