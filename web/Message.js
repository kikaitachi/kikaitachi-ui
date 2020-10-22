export class Message {

  constructor(dataView) {
    this.dataView = dataView;
    this.index = 0;
  }

  getInt() {
    let byte = this.dataView.getInt8(this.index++);
    let sign = (byte & (1 << 6)) != 0 ? -1 : 1;
    let value = byte & 63;
    while ((byte & (1 << 7)) != 0) {
      byte = this.dataView.getInt8(this.index++);
      value = (value << 7) + (byte & 127);
    }
    return value * sign;
  }

  getString() {
    const len = this.getInt();
    let result = '';
    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.dataView.getInt8(this.index++));
    }
    return result;
  }
};
