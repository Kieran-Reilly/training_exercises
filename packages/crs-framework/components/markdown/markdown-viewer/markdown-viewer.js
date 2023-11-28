import { loadHTML } from "./../../../src/load-resources.js";
class MarkdownViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    requestAnimationFrame(async () => {
      await crs.call("component", "notify_ready", {
        element: this
      });
    });
  }
  async set_markdown(markdown, parameters = null) {
    const html = await crs.call("markdown", "to_html", { markdown, parameters });
    this.shadowRoot.querySelector("article").innerHTML = html;
    if (markdown.indexOf("&{") != -1) {
      await crs.binding.translations.parseElement(this);
    }
  }
}
customElements.define("markdown-viewer", MarkdownViewer);
