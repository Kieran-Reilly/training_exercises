import { MaskManager } from "./mask-manager.js";
class MaskedInput extends HTMLInputElement {
  #actions;
  #maskManager;
  #updateHandler;
  async connectedCallback() {
    this.#updateHandler = this.#update.bind(this);
    this.#maskManager = new MaskManager(this.dataset.mask, this.#updateHandler);
    this.#enableActions();
    this.#enableEvents();
  }
  async disconnectedCallback() {
    this.#actions = crs.binding.utils.disposeProperties(this.#actions);
    crs.binding.dom.disableEvents(this);
    this.#maskManager = this.#maskManager.dispose();
    this.#updateHandler = null;
  }
  #enableActions() {
    this.#actions = Object.freeze({
      "ArrowLeft": this.#maskManager.moveIndexLeft.bind(this.#maskManager),
      "ArrowRight": this.#maskManager.moveIndexRight.bind(this.#maskManager),
      "Backspace": this.#maskManager.clearBack.bind(this.#maskManager)
    });
  }
  #enableEvents() {
    crs.binding.dom.enableEvents(this);
    this.registerEvent(this, "focus", this.#focus.bind(this));
    this.registerEvent(this, "keydown", this.#keydown.bind(this));
    this.registerEvent(this, "click", this.#click.bind(this));
  }
  #update(text, index) {
    this.value = text;
    this.setSelectionRange(index, index);
  }
  async #focus(event) {
    event.preventDefault();
    requestAnimationFrame(() => {
      const index = this.#maskManager.currentIndex;
      this.setSelectionRange(index, index);
    });
  }
  async #click(event) {
    if (this.selectionEnd - this.selectionStart > 1) {
      return;
    }
    event.preventDefault();
    requestAnimationFrame(() => {
      if (this.#maskManager.isFilled) {
        return this.#maskManager.setCursor(this.selectionStart);
      }
      const index = this.#maskManager.currentIndex;
      this.setSelectionRange(index, index);
    });
  }
  async #keydown(event) {
    if (event.key.toLowerCase() == "a" && event.ctrlKey == true) {
      return;
    }
    if (event.key == "Tab") {
      return;
    }
    if (event.shiftKey == true) {
      return;
    }
    event.preventDefault();
    if (event.key == " ") {
      return;
    }
    if (this.#actions[event.key] != null) {
      return this.#actions[event.key](this.selectionStart, this.selectionEnd);
    }
    if (this.selectionStart != this.selectionEnd) {
      this.#maskManager.clearBack(this.selectionStart, this.selectionEnd);
      this.selectionEnd = this.selectionStart;
    }
    if (event.key.length == 1) {
      return this.#maskManager.set(event.key);
    }
  }
}
customElements.define("masked-input", MaskedInput, { extends: "input" });
export {
  MaskedInput
};
