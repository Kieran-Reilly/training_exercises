import { loadHTML } from "./../../src/load-resources.js";
class LabelCounter extends HTMLElement {
  #counter = 1;
  #clickHandler = this.#clicked.bind(this);
  // Required for testing
  get clickedHandler() {
    return this.#clickHandler;
  }
  get value() {
    return this.#counter;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
  }
  async load() {
    requestAnimationFrame(() => {
      this.shadowRoot.querySelector("[data-id='label']").textContent = this.dataset.label;
      this.shadowRoot.addEventListener("click", this.#clickHandler);
    });
  }
  async disconnectedCallback() {
    await this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
  }
  async #clicked(event) {
    const target = event.composedPath()[0];
    if (target.dataset.action != null) {
      await this[target.dataset.action](event);
    }
    this.shadowRoot.querySelector("[data-id='value']").textContent = this.#counter;
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: { value: this.#counter }
    }));
    event.stopPropagation();
  }
  async increment(event) {
    this.#counter++;
  }
  async decrement(event) {
    this.#counter--;
    if (this.#counter <= 0) {
      this.#counter = 1;
    }
  }
}
customElements.define("label-counter", LabelCounter);
export {
  LabelCounter
};
