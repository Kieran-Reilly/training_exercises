import { loadHTML } from "./../../src/load-resources.js";
class TabList extends HTMLElement {
  //TODO KR:
  // - Set keyboard interaction NOTE: will be handled by process API
  // - Overflow capabilities
  // - Status icon on tabs
  #clickHandler = this.#clicked.bind(this);
  #target;
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  set target(newValue) {
    this.#target = newValue;
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
  }
  async disconnectedCallback() {
    await this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
    this.#target = null;
  }
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        this.#target = this.#target || document.querySelector(this.getAttribute("for"));
        await crs.binding.translations.parseElement(this);
        await crs.call("component", "notify_ready", { element: this });
        resolve();
      });
    });
  }
  async #clicked(event) {
    const target = event.composedPath()[0];
    await this.selectTab(target.dataset.view, target);
  }
  async selectTab(tab, target) {
    target = target || this.querySelector(`[data-view="${tab}"]`);
    this.#target.view = tab;
    await crs.call("dom_collection", "toggle_selection", { target });
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: { tab }
    }));
  }
}
customElements.define("tab-list", TabList);
export {
  TabList
};
