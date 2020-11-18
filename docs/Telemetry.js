const TELEMETRY_TYPE_INT = 0;
const TELEMETRY_TYPE_STRING = 1;
const TELEMETRY_TYPE_COMMAND = 2;
const TELEMETRY_TYPE_STL = 3;

export class Telemetry {

  #map3d;
  #idToItem = new Map();
  #pressedCodes = new Set();
  #clickedShortcut = null;
  #clickedId;
  #onTelemetryChanged;

  constructor(map3d, onTelemetryChanged) {
    this.#map3d = map3d;
    this.#onTelemetryChanged = onTelemetryChanged;

    window.addEventListener('mouseup', event => {
      if (this.#clickedShortcut) {
        this.#clickedShortcut.classList.remove('pressed');
        this.#clickedShortcut = null;
        this.#onTelemetryChanged(this.#clickedId, 0);
      }
    });

    document.addEventListener('keydown', event => {
      this.#idToItem.forEach((value) => {
        if (value.type == TELEMETRY_TYPE_COMMAND && value.value == event.code) {
          if (!this.#pressedCodes.has(event.code)) {
            this.#onTelemetryChanged(value.id, 1);
            this.#pressedCodes.add(event.code);
            this.#clickedShortcut = document.getElementById('telemetryItemValue' + value.id);
            this.#clickedShortcut.classList.add('pressed');
          }
        }
      });
    });

    document.addEventListener('keyup', event => {
      this.#idToItem.forEach(value => {
        if (value.type == TELEMETRY_TYPE_COMMAND && value.value == event.code) {
          this.#onTelemetryChanged(value.id, 0);
          this.#pressedCodes.delete(event.code);
          this.#clickedShortcut.classList.remove('pressed');
          this.#clickedShortcut = null;
        }
      });
    });
  }

  getContainer() {
    return document.getElementById('telemetry');
  }

  clearItems() {
    this.getContainer().innerHTML = '';
  }

  readDefinition(msg, type) {
    if (type == TELEMETRY_TYPE_INT) {
      return msg.readSignedInt();
    }
    if (type == TELEMETRY_TYPE_STRING || type == TELEMETRY_TYPE_COMMAND) {
      return msg.readString();
    }
    if (type == TELEMETRY_TYPE_STL) {
      return msg.readBlob();
    }
    console.log('Unknown telemetry type: ' + type);
    return undefined;
  }

  readValue(msg, type) {
    if (type == TELEMETRY_TYPE_INT) {
      return msg.readSignedInt();
    }
    if (type == TELEMETRY_TYPE_STRING || type == TELEMETRY_TYPE_COMMAND) {
      return msg.readString();
    }
    if (type == TELEMETRY_TYPE_STL) {
      return msg.readTransforms();
    }
    console.log('Unknown telemetry type: ' + type);
    return undefined;
  }

  addItem(msg) {
    const id = msg.readSignedInt();
    const parentId = msg.readSignedInt();
    const type = msg.readSignedInt();
    const name = msg.readString();
    const value = this.readDefinition(msg, type);
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
    if (type == TELEMETRY_TYPE_COMMAND) {
      item.innerHTML = '<span class="telemetryItemName" style="vertical-align: middle">' + name + '</span> <span class="telemetryItemShortcut" id="telemetryItemValue' + id + '">' + value + '</span>';
      const shortcut = document.getElementById('telemetryItemValue' + id);
      shortcut.addEventListener('mousedown', event => {
        shortcut.classList.add('pressed');
        this.#clickedShortcut = shortcut;
        this.#clickedId = id;
        this.#onTelemetryChanged(id, 1);
      });
    } else if (type == TELEMETRY_TYPE_STL) {
      item.transforms = msg.readTransforms();
      this.#map3d.addSTL(URL.createObjectURL(value)).then(geometry => {
        for (let i = 0; i < item.transforms.length; i++) {
          geometry = item.transforms[i].apply(geometry);
        }
      });
      item.innerHTML = '<span class="telemetryItemName">' + name + '</span>';
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
      if (item.type == TELEMETRY_TYPE_STL) {
        // Revert old transforms
        for (let i = item.transforms.length - 1; i >= 0; i++) {
          geometry = item.transforms[i].revert(geometry);
        }
        // Apply new transforms
        item.transforms = value;
        for (let i = 0; i < item.transforms.length; i++) {
          geometry = item.transforms[i].apply(geometry);
        }
      } else {
        item.value = value;
        item.valueElement.innerHTML = value;
      }
    }
  }
};
