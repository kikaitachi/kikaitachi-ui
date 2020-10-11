export class ServerConnection {
  //url: string;
  connected: boolean = false;

  connect(url: string) {
    const socket = new WebSocket(url);
    socket.onopen = (event) => {
      this.connected = true;
      console.log('WebSocket opened');
    };
    socket.onclose = (event) => {
      this.connected = false;
      console.log('WebSocket closed with code: ' + event.code);
      //setTimeout(function() {connect(onmessage);}, reconnectInMs);
    }
    socket.onerror = (event) => {
      console.log('WebSocket error: ' + event);
    }
    //socket.onmessage = onmessage;
  }
};
