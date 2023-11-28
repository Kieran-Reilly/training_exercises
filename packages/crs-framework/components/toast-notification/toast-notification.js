import { loadHTML } from "./../../src/load-resources.js";
class ToastNotification extends HTMLElement {
  #clickHandler = this.#click.bind(this);
  #icons = Object.freeze({
    "success": "check-circle",
    "warning": "warning",
    "error": "error",
    "info": "info"
  });
  /**
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * Standard connected callback lifecycle method
   */
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    requestAnimationFrame(() => this.load());
  }
  /**
   * Load resources and add event listeners
   * @returns {Promise<void>}
   */
  async load() {
    this.shadowRoot.addEventListener("click", this.#clickHandler);
  }
  /**
   * Standard disconnected callback lifecycle method
   */
  async disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.shadowRoot.innerHTML = "";
    this.#clickHandler = null;
  }
  /**
   * Click handler for interacting with the toast notification
   * @param event - The event that triggered the function.
   */
  async #click(event) {
    const composition = event.composedPath();
    const target = composition[0];
    const parent = composition[1];
    if (target.id === "btnClose") {
      await this.#removeElement(parent);
    }
  }
  /**
   * It removes the element from the DOM and then calls the fixed_position set function to update the position of the
   * element
   * @param element - The element to remove.
   */
  async #removeElement(element) {
    const btnAction = element.querySelector("#btnAction");
    if (btnAction != null) {
      btnAction.onclick = null;
    }
    element.remove();
    await crs.call("fixed_position", "set", { element: this, position: this.dataset.position, margin: this.dataset.margin });
  }
  /**
   * After a period of time remove the element from the DOM
   * @param element {HTMLElement} - element to remove
   * @param duration {number} - duration in milliseconds
   */
  #setTimeout(element, duration) {
    return new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        clearTimeout(timeout);
        await this.#removeElement(element);
        resolve();
      }, duration);
    });
  }
  /**
   * Show a toast notification
   * @param duration {number} - duration in milliseconds that the toast will be displayed
   * @param message {string} - message to display
   * @param severity {string} - severity of the toast notification, "info"|"error"|"warning|"success"
   * @param action - action to perform when the action button is clicked
   * @returns {Promise<void>}
   */
  async show(duration, message, severity, action) {
    const toast = this.shadowRoot.querySelector("#toast-notification-item").content.cloneNode(true).children[0];
    toast.dataset.severity = severity;
    toast.querySelector("#message").innerText = message;
    const btnAction = toast.querySelector("#btnAction");
    if (action == null) {
      btnAction.remove();
    } else {
      btnAction.textContent = action.caption;
      btnAction.onclick = action.callback;
      const btnClose = toast.querySelector("#btnClose");
      btnClose.style.borderLeft = "var(--border)";
    }
    const icon = toast.querySelector("icon");
    icon.textContent = this.#icons[severity];
    icon.dataset.severity = severity;
    if (message.indexOf("\n") !== -1) {
      icon.style.alignSelf = "flex-start";
    }
    this.shadowRoot.appendChild(toast);
    await crs.call("fixed_position", "set", { element: this, position: this.dataset.position, margin: this.dataset.margin });
    await this.#setTimeout(toast, duration);
  }
}
customElements.define("toast-notification", ToastNotification);
