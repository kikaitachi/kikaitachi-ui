import { Transform } from "/Transform.js";

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

  readFloat() {
    const value = this.dataView.getFloat32(this.index);
    this.index += 4;
    return value;
  }

  readString() {
    const len = this.readUnsignedInt();
    let result = '';
    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.dataView.getInt8(this.index++));
    }
    return result;
  }

  readByte() {
    return this.dataView.getUint8(this.index++);
  }

  readBlob() {
    const size = this.readUnsignedInt();
    const blob = new Blob([this.dataView.buffer.slice(this.index, this.index + size)],	{ type: 'application/octet-stream' });
    this.index += size;
    return blob;
  }

  readTransforms() {
    const transforms = [];
    while (this.index < this.dataView.byteLength) {
      transforms.push(new Transform(this.readSignedInt(), this.readSignedInt(), this.readFloat()));
    }
    return transforms;
  }

  readPoints() {
    const points = [];
    while (this.index < this.dataView.byteLength) {
      points.push({
        x: this.readFloat() * 1000,
        y: this.readFloat() * 1000,
        z: this.readFloat() * 1000,
        r: this.readByte(),
        g: this.readByte(),
        b: this.readByte()
      });
    }
    console.log('Number of points: ' + points.length);
    return points;
  }

  readModifiers() {
    const modifiers = [];
    while (this.index < this.dataView.byteLength) {
      modifiers.push(this.readString());
    }
    return modifiers;
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
