import { loadHTML } from "./../../src/load-resources.js";
class BusyUi extends HTMLElement {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * @method connectedCallback - called when the element is added to the DOM
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
    await crs.call("component", "notify_ready", { element: this });
  }
  /**
   * @method load - load resources and attach event listeners
   * @returns {Promise<unknown>}
   */
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.shadowRoot.querySelector("#lblMessage").innerText = this.dataset.message;
        resolve();
      });
    });
  }
}
customElements.define("busy-ui", BusyUi);
export {
  BusyUi
};
