import { loadHTML } from "./../../src/load-resources.js";
class GroupBox extends HTMLElement {
  #clickHandler = this.#click.bind(this);
  #headerKeyHandler = this.#headerKeyUp.bind(this);
  static get observedAttributes() {
    return ["data-title"];
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
    await this.#setTabIndex();
  }
  /**
   * @method load - load the component.
   * set up event listeners and set aria attributes.
   * @returns {Promise<void>}
   */
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.setAttribute("aria-expanded", "true");
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        this.shadowRoot.querySelector("header").addEventListener("keyup", this.#headerKeyHandler);
        this.shadowRoot.querySelector("#title").textContent = this.dataset.title;
        await crs.call("component", "notify_ready", {
          element: this
        });
        resolve();
      });
    });
  }
  async disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.shadowRoot.querySelector("header").removeEventListener("keyup", this.#headerKeyHandler);
    this.#clickHandler = null;
    this.#headerKeyHandler = null;
  }
  /**
   * @method click - When the user clicks on the button, toggle the expanded state of the card
   * This is the event handler for the click event.
   * @param event {MouseEvent} - The event object that was triggered.
   */
  async #click(event) {
    const target = event.composedPath()[0];
    if (target.id === "btnToggleExpand") {
      await this.#toggleExpanded();
    }
  }
  /**
   * @method headerKeyUp - handle key up events on the header.
   * This in particular handles the aria keyboard shortcuts to expand or collapse the group box.
   * Options:
   * 1. ArrowUp - collapse the group box.
   * 2. ArrowDown - expand the group box.
   * @param event {MouseEvent} - standard event
   * @returns {Promise<void>}
   */
  async #headerKeyUp(event) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    this.setAttribute("aria-expanded", event.key === "ArrowUp" ? "false" : "true");
  }
  /**
   * @method toggleExpanded - toggle the expanded state of the group bo.
   * @returns {Promise<void>}
   */
  async #toggleExpanded() {
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !expanded);
    if (this.shadowRoot.querySelector("#btnToggleExpand") != null) {
      this.shadowRoot.querySelector("#btnToggleExpand").setAttribute("aria-expanded", !expanded);
    }
    await this.#setTabIndex();
  }
  /**
   * @method attributeChangedCallback - handle attribute changes.
   * In particular, we are looking for the data-title attribute.
   * If it changes, we update the title element.
   * @param name {string} - name of the attribute
   * @param oldValue {string} - old value of the attribute
   * @param newValue {string} - new value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-title") {
      const titleElement = this.shadowRoot.querySelector("#title");
      if (titleElement != null) {
        titleElement.textContent = this.dataset.title;
      }
    }
  }
  /**
   * @method #setTabIndex - If the main element is visible, set its tabindex to 0, otherwise set it to -1
   */
  async #setTabIndex() {
    if (this.dataset.ready !== "true")
      return;
    const ariaExpanded = this.getAttribute("aria-expanded");
    const main = this.shadowRoot.querySelector("#main");
    main.setAttribute("tabindex", ariaExpanded === "true" ? "0" : "-1");
  }
}
customElements.define("group-box", GroupBox);
export {
  GroupBox
};
