const TELEMETRY_TYPE_INT = 0;
const TELEMETRY_TYPE_STRING = 1;

export class Telemetry {
  getContainer() {
    return document.getElementById('telemetry');
  }

  clearItems() {
    this.getContainer().innerHTML = '';
  }

  addItem(msg) {
    const id = msg.readSignedInt();
    const parentId = msg.readSignedInt();
    const type = msg.readSignedInt();
    const name = msg.readString();
    console.log('Telemetry definition message: id = ' + id + ', parentId = ' + parentId + ', type = ' + type + ', name = ' + name);
    let value = '';
    if (type == TELEMETRY_TYPE_INT) {
      value = msg.readSignedInt();
      console.log("Value: " + value);
    } else if (type == TELEMETRY_TYPE_STRING) {
      value = msg.readString();
      console.log("Value: " + value);
    } else {
      console.log('Unknown telemetry type: ' + type);
      return;
    }
    const itemContainer = document.createElement("div");
    itemContainer.className = 'telemetryItemContainer';
    const item = document.createElement("div");
    item.className = 'telemetryItem';
    item.innerHTML = '<span class="telemetryItemName">' + name + '</span>: <span class="telemetryItemValue">' + value + '</span>';
    itemContainer.appendChild(item);
    this.getContainer().appendChild(itemContainer);
  }
};
