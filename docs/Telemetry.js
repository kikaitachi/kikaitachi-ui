import { Button } from "/Button.js";

const TELEMETRY_TYPE_INT = 0;
const TELEMETRY_TYPE_STRING = 1;
const TELEMETRY_TYPE_FLOAT = 2;
const TELEMETRY_TYPE_COMMAND = 3;
const TELEMETRY_TYPE_STL = 4;
const TELEMETRY_TYPE_POINTS = 5;
const TELEMETRY_TYPE_CHOICES = 6;

const MODIFIER_KEYS = [
  "Alt",
  "AltGraph",
  "CapsLock",
  "Control",
  "Meta",
  "NumLock",
  "ScrollLock",
  "Shift"
];

export class Telemetry {

  #map3d;
  #idToItem = new Map();
  #pressedCodes = new Set();
  #onTelemetryChanged;

  constructor(map3d, onTelemetryChanged) {
    this.#map3d = map3d;
    this.#onTelemetryChanged = onTelemetryChanged;

    document.addEventListener('keydown', event => {
      this.#idToItem.forEach((value) => {
        if (value.type == TELEMETRY_TYPE_COMMAND && value.value == event.code) {
          if (!this.#pressedCodes.has(event.code)) {
            this.#onTelemetryChanged(value.id, 1, this.getModifiers(event));
            this.#pressedCodes.add(event.code);
            value.valueElement.classList.add('pressed');
          }
        }
      });
    });

    document.addEventListener('keyup', event => {
      this.#idToItem.forEach(value => {
        if (value.type == TELEMETRY_TYPE_COMMAND && value.value == event.code) {
          this.#onTelemetryChanged(value.id, 0, this.getModifiers(event));
          this.#pressedCodes.delete(event.code);
          value.valueElement.classList.remove('pressed');
        }
      });
    });
  }

  getModifiers(event) {
    const modifiers = [];
    MODIFIER_KEYS.forEach(modifier => {
      if (event.getModifierState(modifier)) {
        modifiers.push(modifier);
      }
    })
    return modifiers;
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
    if (type == TELEMETRY_TYPE_FLOAT) {
      return msg.readFloat();
    }
    if (type == TELEMETRY_TYPE_STL) {
      return msg.readBlob();
    }
    if (type == TELEMETRY_TYPE_CHOICES) {
      return msg.readChoices();
    }
    console.log('Unknown telemetry type: ' + type);
    return undefined;
  }

  readValue(msg, type) {
    if (type == TELEMETRY_TYPE_INT || type == TELEMETRY_TYPE_CHOICES) {
      return msg.readSignedInt();
    }
    if (type == TELEMETRY_TYPE_STRING || type == TELEMETRY_TYPE_COMMAND) {
      return msg.readString();
    }
    if (type == TELEMETRY_TYPE_FLOAT) {
      return msg.readFloat();
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
    const itemElement = document.createElement("div");
    itemElement.className = 'telemetryItem';
    itemContainer.appendChild(itemElement);
    const parentItem = this.#idToItem.get(parentId);
    const item = {
      id: id,
      parentId: parentId,
      type: type,
      name: name,
      value: value,
      containerElement: itemContainer
    };
    if (parentItem) {
      parentItem.containerElement.appendChild(itemContainer);
    } else {
      this.getContainer().appendChild(itemContainer);
    }
    if (type == TELEMETRY_TYPE_COMMAND) {
      itemElement.innerHTML = '<span class="telemetryItemName" style="vertical-align: middle">' + name + '</span>';
      const shortcut = new Button(value)
        .id('telemetryItemValue' + id)
        .className('telemetryItemShortcut')
        .onPress(event => {
          event.target.classList.add('pressed');
          this.#onTelemetryChanged(id, 1, this.getModifiers(event));
        })
        .onRelease(event => {
          event.target.classList.remove('pressed');
          this.#onTelemetryChanged(id, 0, this.getModifiers(event));
        })
        .element();
      itemElement.appendChild(shortcut);
      msg.readModifiers().forEach(modifier => {
        shortcut.parentElement.insertBefore(new Button(modifier)
          .className('telemetryItemShortcut')
          .onPress(event => {
            event.target.classList.add('pressed');
          })
          .element(), shortcut);
      });
    } else if (type == TELEMETRY_TYPE_STL) {
      item.color = msg.readUnsignedInt();
      item.transforms = msg.readTransforms();
      this.#map3d.addSTL(URL.createObjectURL(value), item.color).then(geometry => {
        item.geometry = geometry;
        for (let i = 0; i < item.transforms.length; i++) {
          item.geometry = item.transforms[i].apply(item.geometry);
        }
      });
      itemElement.innerHTML = '<span class="partName" style="background-color: #' + new Number(item.color).toString(16) + '99">' + name + '</span>';
    } else if (type == TELEMETRY_TYPE_CHOICES) {
      const select = value.toDOM();
      select.addEventListener('change', () => {
        this.#onTelemetryChanged(id, select.selectedIndex);
      });
      itemElement.appendChild(document.createTextNode(name + ': '));
      itemElement.appendChild(select);
    } else if (type == TELEMETRY_TYPE_POINTS) {
      this.#map3d.addPoints(msg.readPoints());
    } else {
      itemElement.innerHTML = '<span class="telemetryItemName">' + name + '</span>: <span class="telemetryItemValue" id="telemetryItemValue' + id + '">' + value + '</span>';
    }
    item.valueElement = document.getElementById('telemetryItemValue' + id);
    this.#idToItem.set(id, item);
  }

  updateItem(msg) {
    const id = msg.readSignedInt();
    const item = this.#idToItem.get(id);
    if (item) {
      const value = this.readValue(msg, item.type);
      if (item.type == TELEMETRY_TYPE_STL) {
        // Revert old transforms
        for (let i = item.transforms.length - 1; i >= 0; i--) {
          item.geometry = item.transforms[i].revert(item.geometry);
        }
        // Apply new transforms
        item.transforms = value;
        for (let i = 0; i < item.transforms.length; i++) {
          item.geometry = item.transforms[i].apply(item.geometry);
        }
      } else if (item.type == TELEMETRY_TYPE_CHOICES) {
        item.value.select(value);
      } else {
        item.value = value;
        item.valueElement.innerHTML = value;
      }
    }
  }
};
