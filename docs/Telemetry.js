const TELEMETRY_TYPE_INT = 0;
const TELEMETRY_TYPE_STRING = 1;
const TELEMETRY_TYPE_ACTION = 2;
const TELEMETRY_TYPE_STL = 3;

export class Telemetry {

  #idToItem = new Map();
  #clickedShortcut = null;

  constructor() {
    window.addEventListener('mouseup', event => {
      if (this.#clickedShortcut) {
        this.#clickedShortcut.classList.remove('pressed');
        this.#clickedShortcut = null;
      }
    });
  }

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
    if (type == TELEMETRY_TYPE_STRING || type == TELEMETRY_TYPE_ACTION) {
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
    itemContainer.appendChild(item);
    const parentItem = this.#idToItem.get(parentId);
    if (parentItem) {
      parentItem.containerElement.appendChild(itemContainer);
    } else {
      this.getContainer().appendChild(itemContainer);
    }
    if (type == TELEMETRY_TYPE_ACTION) {
      item.innerHTML = '<span class="telemetryItemName" style="vertical-align: middle">' + name + '</span> <span class="telemetryItemShortcut" id="telemetryItemValue' + id + '">' + value + '</span>';
      const shortcut = document.getElementById('telemetryItemValue' + id);
      shortcut.addEventListener('mousedown', event => {
        shortcut.classList.add('pressed');
        this.#clickedShortcut = shortcut;
      });
    } else {
      item.innerHTML = '<span class="telemetryItemName">' + name + '</span>: <span class="telemetryItemValue" id="telemetryItemValue' + id + '">' + value + '</span>';
    }
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
