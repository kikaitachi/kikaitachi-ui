export class Button {

  #label;
  #id;
  #className;
  #onPress;
  #onRelease;
  #shortcut

  constructor(label) {
    this.#label = label;
  }

  id(id) {
    this.#id = id;
    return this;
  }

  className(className) {
    this.#className = className;
    return this;
  }

  onPress(callback) {
    this.#onPress = callback;
    return this;
  }

  onRelease(callback) {
    this.#onRelease = callback;
    return this;
  }

  shortcut(code) {
    this.#shortcut = code;
    return this;
  }

  element() {
    const element = document.createElement('span');
    if (this.#id) {
      element.id = this.#id;
    }
    if (this.#className) {
      element.className = this.#className;
    }
    if (this.#label) {
      element.innerHTML = this.#label;
    }
    if (this.#onPress) {
      element.addEventListener('mousedown', this.#onPress);
    }
    return element;
  }
};
