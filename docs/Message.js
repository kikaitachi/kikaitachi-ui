export class Message {

  constructor(dataView) {
    this.dataView = dataView;
    this.index = 0;
  }

  getUnsignedInt() {
    let byte = this.dataView.getInt8(this.index++);
    let value = byte & 127;
    let shift = 7;
    while ((byte & (1 << 7)) != 0) {
      byte = this.dataView.getInt8(this.index++);
      value = value + ((byte & 127) << shift);
      shift += 7;
    }
    return value;
  }

  getSignedInt() {
    let byte = this.dataView.getInt8(this.index++);
    let sign = (byte & (1 << 6)) != 0 ? -1 : 1;
    let value = byte & 63;
    let shift = 6;
    while ((byte & (1 << 7)) != 0) {
      byte = this.dataView.getInt8(this.index++);
      value = value + ((byte & 127) << shift);
      shift += 7;
    }
    return value * sign;
  }

  getFloat() {
    return getSignedInt() / getUnsignedInt();
  }

  getString() {
    const len = this.getSignedInt();
    let result = '';
    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.dataView.getInt8(this.index++));
    }
    return result;
  }
};