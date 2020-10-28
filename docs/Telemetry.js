const TELEMETRY_TYPE_INT = 0;
const TELEMETRY_TYPE_STRING = 1;

export class Telemetry {

  #idToItem = new Map();

  getContainer() {
    return document.getElementById('telemetry');
  }

  clearItems() {
    this.getContainer().innerHTML = '';
  }

  readValue(msg, type) {
    if (type == TELEMETRY_TYPE_INT) {
      return msg.readSignedInt();
    }
    if (type == TELEMETRY_TYPE_STRING) {
      return msg.readString();
    }
    console.log('Unknown telemetry type: ' + type);
    return undefined;
  }

  addItem(msg) {
    const id = msg.readSignedInt();
    const parentId = msg.readSignedInt();
    const type = msg.readSignedInt();
    const name = msg.readString();
    const value = this.readValue(msg, type);
    const itemContainer = document.createElement("div");
    itemContainer.className = 'telemetryItemContainer';
    const item = document.createElement("div");
    item.className = 'telemetryItem';
    item.innerHTML = '<span class="telemetryItemName">' + name + '</span>: <span class="telemetryItemValue" id="telemetryItemValue' + id + '">' + value + '</span>';
    itemContainer.appendChild(item);
    this.getContainer().appendChild(itemContainer);
    this.#idToItem.set(id, {
      id: id,
      parentId: parentId,
      type: type,
      name: name,
      value: value,
      containerElement: itemContainer,
      valueElement: document.getElementById('telemetryItemValue' + id)
    });
  }

  updateItem(msg) {
    const id = msg.readSignedInt();
    const item = this.#idToItem.get(id);
    if (item) {
      const value = this.readValue(msg, item.type);
      item.value = value;
      item.valueElement.innerHTML = value;
    }
  }
};
