export class MessageIn {

  constructor(dataView) {
    this.dataView = dataView;
    this.index = 0;
  }

  readUnsignedInt() {
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

  readSignedInt() {
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

  readDouble() {
    /*const value = this.dataView.getFloat64(this.index, true);
    this.index += 8;
    return value;*/
    return this.readSignedInt() / this.readSignedInt();
  }

  readString() {
    const len = this.readSignedInt();
    let result = '';
    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.dataView.getInt8(this.index++));
    }
    return result;
  }

  readBlob() {
    const size = this.readSignedInt();
    const blob = new Blob([this.dataView.buffer.slice(this.index, this.index + size)],	{ type: 'application/octet-stream' });
    this.index += size;
    return blob;
  }
};

export class MessageOut {

  constructor() {
    this.bytes = [];
  }

  writeSignedInt(value) {
    let sign = 0;
    if (value < 0) {
      sign = 1 << 6;
      value = -value;
    }
    this.bytes.push(((value > 63 ? 1 : 0) << 7) | sign | (value & 63));
    value >>= 6;
    while (value > 0) {
      this.bytes.push(((value > 127 ? 1 : 0) << 7) | (value & 127));
      value >>= 7;
    }
  }

  getBuffer() {
    const buffer = new ArrayBuffer(this.bytes.length);
    const dataView = new DataView(buffer);
    for (let i = 0; i < this.bytes.length; i++) {
      dataView.setUint8(i, this.bytes[i]);
    }
    return dataView.buffer;
  }
};
