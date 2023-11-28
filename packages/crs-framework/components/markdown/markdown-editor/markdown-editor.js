import { loadHTML } from "./../../../src/load-resources.js";
import "../markdown-viewer/markdown-viewer.js";
import "../../text-editor/text-editor.js";
class MarkdownEditor extends HTMLElement {
  #markdown;
  #textEditor;
  #viewer;
  #textChangedHandler = this.#textChanged.bind(this);
  #waiting;
  #lastTime;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    requestAnimationFrame(async () => {
      this.#textEditor = this.shadowRoot.querySelector("text-editor");
      this.#textEditor.addEventListener("change", this.#textChangedHandler);
      this.#viewer = this.shadowRoot.querySelector("markdown-viewer");
      await crs.call("cssgrid", "enable_resize", {
        element: this,
        options: {
          columns: [0]
        }
      });
      await crs.call("component", "notify_ready", {
        element: this
      });
    });
  }
  async disconnectedCallback() {
    await crs.call("cssgrid", "disable_resize", { element: this });
    this.#textEditor.removeEventListener("change", this.#textChangedHandler);
    this.#textEditor = null;
    this.#viewer = null;
    this.#markdown = null;
  }
  async set_markdown(markdown, parameters = null) {
    this.#textEditor.value = markdown;
    await this.#viewer.set_markdown(markdown, parameters);
  }
  #checkChange() {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      this.#updateHTML();
      this.#waiting = false;
    }, 16);
  }
  async #textChanged(event) {
    if (this.#markdown == event.detail)
      return;
    this.#markdown = event.detail;
    this.#lastTime = performance.now();
    if (this.#waiting != true) {
      this.#waiting = true;
      await this.#checkChange();
    }
  }
  async #updateHTML() {
    requestAnimationFrame(() => {
      this.#viewer.set_markdown(this.#markdown);
    });
  }
}
customElements.define("markdown-editor", MarkdownEditor);
