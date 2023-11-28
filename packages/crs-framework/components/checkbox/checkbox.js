import { loadHTML } from "./../../src/load-resources.js";
class Checkbox extends HTMLElement {
  #checked;
  #iconElement;
  #clickHandler = this.#clicked.bind(this);
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  /**
   * @property checked {bool|string} - The checked state of the checkbox.
   *
   * Values are one of:
   * 1. true
   * 2. false
   * 3. "mixed"
   * @returns {*}
   */
  get checked() {
    if (this.#checked === "null")
      return null;
    return this.#checked;
  }
  /**
   * @property checked {bool|string} - The checked state of the checkbox.
   *
   * @param newValue {bool|string} - new value to set checked as.
   * Values are one of:
   * 1. true
   * 2. false
   * 3. "mixed"
   */
  set checked(newValue) {
    this.#checked = newValue;
    this.#setState(newValue);
  }
  /**
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * @method connectedCallback - Called when the element is added to the DOM.
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    const ariaCheckedAttribute = this.getAttribute("aria-checked");
    this.#checked = ariaCheckedAttribute === "true" || (this.dataset.nullable === "true" ? "null" : false);
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
  }
  /**
   * @method load - load the component and set up event listeners.
   * @returns {Promise<unknown>}
   */
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.setAttribute("aria-checked", this.#checked);
        this.setAttribute("role", "checkbox");
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        this.#iconElement = this.shadowRoot.querySelector("#btnCheck");
        this.shadowRoot.querySelector("#lblText").innerText = this.getAttribute("aria-label");
        this.#setState(this.#checked);
        resolve();
      });
    });
  }
  /**
   * @method disconnectedCallback - Called when the element is removed from the DOM.
   * @returns {Promise<void>}
   */
  async disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
  }
  /**
   * @method setState - Sets the state of the checkbox.
   * It sets the state of the checkbox to the value passed in, and updates the icon and aria-checked attributes
   * accordingly.
   * @param value {bool|string} - The value to set the checkbox to. Accepts true, false, and "mixed".
   */
  #setState(value) {
    if (this.#iconElement == null)
      return;
    const nullable = this.dataset.nullable == "true";
    const state = {
      true: true,
      false: false,
      null: nullable ? null : false,
      mixed: "mixed"
    };
    value = state[value];
    this.setAttribute("aria-checked", value);
    this.#iconElement.setAttribute("aria-checked", value);
    this.#iconElement.innerText = {
      true: "check-box",
      false: "check-box-blank",
      null: "check-box-null",
      mixed: "check-box-mixed"
    }[value];
    this.#checked = value;
    this.dispatchEvent(new CustomEvent("checkedChange", {
      bubbles: true,
      composed: true
    }));
  }
  /**
   * @method clicked - Handles the click event.
   * Get the next state and use setState to set the state.
   *
   * It toggles the state of the checkbox
   * @param event - The event object that was triggered.
   */
  #clicked(event) {
    const nullable = this.dataset.nullable == "true";
    const state = this.getAttribute("aria-checked");
    const nextState = {
      true: "false",
      false: nullable ? null : "true",
      null: "true",
      mixed: "true"
    }[state];
    this.#setState(nextState);
  }
}
customElements.define("check-box", Checkbox);
export {
  Checkbox
};
