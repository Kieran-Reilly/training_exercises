import "./../../text-editor/text-editor.js";
import "./../../schema/schema-viewer/schema-viewer.js";
import { loadHTML } from "./../../src/load-resources.js";
const startTemplate = `{
  "variables": {
    "translations": {
      "button": "My Button"
    }
  },
  "body": {
    "elements": [
      {
        "element": "button",
        "caption": "@translations.button"
      }
    ]
  }
}
`;
class SchemaEditor extends HTMLElement {
  #editor;
  #textChangedHandler = this.#textChanged.bind(this);
  #waiting;
  get parser() {
    return this.dataset.parser || "html";
  }
  get editor() {
    if (this.#editor == null) {
      this.#editor = this.querySelector("text-editor");
    }
    return this.#editor;
  }
  async connectedCallback() {
    this.innerHTML = await loadHTML(import.meta.url);
    requestAnimationFrame(async () => {
      this.editor.value = startTemplate;
      await this.update();
      this.editor.addEventListener("change", this.#textChangedHandler);
      await crs.call("cssgrid", "enable_resize", {
        element: this,
        options: {
          columns: [0]
        }
      });
    });
  }
  async disconnectedCallback() {
    this.editor.removeEventListener("change", this.#textChangedHandler);
    this.#textChangedHandler = null;
    await crs.call("cssgrid", "disable_resize", { element: this });
    this.#editor = null;
    this.#waiting = null;
  }
  async #textChanged(event) {
    if (this.#waiting != true) {
      this.#waiting = true;
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        this.update();
        this.#waiting = false;
      }, 32);
    }
  }
  async update() {
    const viewer = this.querySelector("schema-viewer");
    try {
      const text = this.editor.value;
      const json = JSON.parse(text);
      await viewer.set_schema(this.parser, json);
    } catch {
      return;
    }
  }
}
customElements.define("schema-editor", SchemaEditor);
export {
  SchemaEditor
};
