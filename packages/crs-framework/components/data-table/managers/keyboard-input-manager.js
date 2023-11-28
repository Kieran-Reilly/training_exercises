import { DataTableExtensions } from "./../data-table-extensions.js";
class KeyboardInputManager {
  #table;
  #keyupHandler;
  #fnMap = {
    "ArrowUp": this.#arrowUp,
    "ArrowDown": this.#arrowDown,
    "ArrowLeft": this.#arrowLeft,
    "ArrowRight": this.#arrowRight,
    "Enter": this.#enter
  };
  constructor(table) {
    this.#table = table;
    this.#keyupHandler = this.#keyup.bind(table);
    this.#table.shadowRoot.addEventListener("keyup", this.#keyupHandler);
  }
  dispose() {
    this.#table.shadowRoot.removeEventListener("keyup", this.#keyupHandler);
    this.#table = null;
    this.#keyupHandler = null;
    this.#fnMap = null;
    return null;
  }
  async #keyup(event) {
    if (this.#fnMap[event.key]) {
      this.#fnMap[event.key].call(this, event);
    }
  }
  async #arrowUp(event) {
    console.log("arrow up");
  }
  async #arrowDown(event) {
    console.log("arrow down");
  }
  async #arrowLeft(event) {
    console.log("arrow left");
  }
  async #arrowRight(event) {
    console.log("arrow right");
  }
  async #enter(event) {
    await this.#table.callExtension(DataTableExtensions.CELL_EDITING.name, "toggleEditing", this.#table.selectedCells[0]);
  }
}
export {
  KeyboardInputManager
};
