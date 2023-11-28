import { loadHTML } from "./../../src/load-resources.js";
class OptionsToolbar extends HTMLElement {
  #clickHandler = this.#click.bind(this);
  #previouslySelected;
  #parent;
  get selected() {
    return this.dataset.value;
  }
  set selected(value) {
    if (value == null)
      return;
    const element = this.querySelector(`[data-value='${value}']`);
    if (element != null && this.dataset.ready === "true") {
      this.#setSelected(element).catch((error) => console.error(error));
    } else {
      this.dataset.value = value;
    }
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
  }
  /**
   * @method load - load the component.
   * set up event listeners and set aria attributes.
   * @returns {Promise<void>}
   */
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.setAttribute("role", "toggle-switch");
        this.setAttribute("aria-label", "toggle-switch");
        this.#parent = this.shadowRoot.querySelector(".parent");
        const selectedItem = this.querySelector(`[data-value='${this.dataset.value}']`) ?? this.querySelector(`[aria-selected='true']`) ?? this.firstElementChild;
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        let timeout = setTimeout(async () => {
          await this.#setSelected(selectedItem, false);
          clearTimeout(timeout);
        }, 0.5);
        await crs.call("component", "notify_ready", {
          element: this
        });
        resolve();
      });
    });
  }
  async disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
    this.#previouslySelected = null;
  }
  /**
   * @method setSelected - It sets the selected item in the toolbar
   * @param element - The element to select.
   * @param [dispatchEvent=true] - Whether to dispatch a change event or not.
   */
  async #setSelected(element, dispatchEvent = true) {
    await crs.call("dom_collection", "toggle_selection", {
      target: element
    });
    this.dataset.value = element.dataset.value;
    this.#previouslySelected = element;
    if (dispatchEvent === true) {
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: element.dataset.value
      }));
    }
  }
  /**
   * @method click - When a button is clicked, set the selected button to the button that was clicked
   * @param event - The event object that was triggered.
   */
  async #click(event) {
    const target = await crs.call("dom_utils", "find_parent_of_type", { element: event?.target, nodeName: "BUTTON" });
    if (target != null) {
      await this.#setSelected(target);
    }
  }
}
customElements.define("options-toolbar", OptionsToolbar);
