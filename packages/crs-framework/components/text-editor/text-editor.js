import { EditorView, basicSetup, markdown, json, css, javascript, html, autocompletion, keymap, indentWithTab } from "./editor.js";
const LANGUAGES = Object.freeze({
  "markdown": markdown,
  "json": json,
  "javascript": javascript,
  "css": css,
  "html": html
});
class TextEditor extends HTMLElement {
  #editor;
  #value;
  #update;
  get editor() {
    return this.#editor;
  }
  get value() {
    return this.#getValue();
  }
  set value(newValue) {
    this.#value = newValue;
    if (this.#editor != null) {
      this.#setValue(newValue);
    }
  }
  get language() {
    return this.dataset.language || "markdown";
  }
  async connectedCallback() {
    const content = this.innerHTML.trim();
    this.innerHTML = "";
    this.#update = EditorView.updateListener.of((update) => {
      if (update.docChanged == true) {
        this.dispatchEvent(new CustomEvent("change", { detail: this.#getValue(), bubbles: true, composed: true }));
      }
    });
    this.#editor = new EditorView({
      extensions: [basicSetup, LANGUAGES[this.language](), autocompletion(), this.#update, keymap.of([indentWithTab])],
      parent: this
    });
    if (this.#value != null) {
      this.#setValue(this.#value);
    } else if (content.length > 0) {
      this.#setValue(content);
    }
    await crs.call("component", "notify_ready", { element: this });
  }
  async disconnectedCallback() {
    this.#editor = null;
    this.#update = null;
    this.#value = null;
  }
  #setValue(text) {
    this.#editor.dispatch({
      changes: { from: 0, to: this.#editor.state.doc.length, insert: text }
    });
  }
  #getValue() {
    if (this.#editor == null)
      return "";
    return this.#editor.state.doc.toString();
  }
}
customElements.define("text-editor", TextEditor);
