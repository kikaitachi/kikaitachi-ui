export class Choices {

  #select;

  constructor(choices, selected) {
    this.#select = document.createElement('select');
    for (let i = 0; i < choices.length; i++) {
      const option = document.createElement('option');
      option.innerHTML = choices[i];
      if (selected == i) {
        option.setAttribute('selected', 'selected');
      }
      this.#select.appendChild(option);
    }
  }

  select(index) {
    this.#select.selectedIndex = index;
  }

  toDOM() {
    return this.#select;
  }
};
