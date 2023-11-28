import "./color-gradient.js";
import "./color-panel.js";
class ColorPicker extends crs.classes.BindableElement {
  #bounds;
  #panelBounds;
  #gradientBounds;
  #x;
  #y;
  #panelMove = false;
  #panelMouseDownHandler = this.#panelMouseDown.bind(this);
  #panelMouseMoveHandler = this.#panelMouseMove.bind(this);
  #panelMouseUpHandler = this.#panelMouseUp.bind(this);
  #gradientMouseDownHandler = this.#gradientMouseDown.bind(this);
  #gradientMouseMoveHandler = this.#gradientMouseMove.bind(this);
  #gradientMouseUpHandler = this.#gradientMouseUp.bind(this);
  #panelCtx;
  #gradientCtx;
  get shadowDom() {
    return true;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get baseColor() {
    return this.getAttribute("value");
  }
  set baseColor(newValue) {
    this.value = newValue;
    this.setAttribute("value", newValue);
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true }));
  }
  static get observedAttributes() {
    return ["value"];
  }
  async connectedCallback() {
    await super.connectedCallback();
    this.#bounds = this.getBoundingClientRect();
    this.#panelBounds = this.panel.getBoundingClientRect();
    this.#gradientBounds = this.gradient.getBoundingClientRect();
    this.panel.setAttribute("value", this.baseColor || "#FF0000");
    this.registerEvent(this.panel, "mousedown", this.#panelMouseDownHandler);
    this.registerEvent(this.gradient, "mousedown", this.#gradientMouseDownHandler);
  }
  async disconnectedCallback() {
    this.#bounds = null;
    this.#panelBounds = null;
    this.#gradientBounds = null;
    this.#x = null;
    this.#y = null;
    this.#panelMove = null;
    this.#panelMouseDownHandler = null;
    this.#panelMouseMoveHandler = null;
    this.#panelMouseUpHandler = null;
    this.#gradientMouseDownHandler = null;
    this.#gradientMouseMoveHandler = null;
    this.#gradientMouseUpHandler = null;
    this.#panelCtx = null;
    this.#gradientCtx = null;
    super.disconnectedCallback();
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    this.panel?.setAttribute("value", newValue);
  }
  async #panelMouseDown(event) {
    event.preventDefault();
    this.#panelCtx = this.panel.getContext("2d", { willReadFrequently: true });
    this.#panelMove = true;
    this.#x = event.clientX - this.#bounds.x;
    this.#y = event.clientY - this.#bounds.y;
    this.registerEvent(document, "mousemove", this.#panelMouseMoveHandler);
    this.registerEvent(document, "mouseup", this.#panelMouseUpHandler);
    await this.#panelAnimate();
  }
  async #panelMouseMove(event) {
    event.preventDefault();
    const point = ptInRect({ x: event.clientX, y: event.clientY }, this.#panelBounds);
    this.#x = point.x - this.#bounds.left;
    this.#y = point.y - this.#bounds.top;
    const rgb = this.panel.get(this.#x, this.#y);
  }
  async #panelMouseUp(event) {
    event.preventDefault();
    this.#panelMove = false;
    this.unregisterEvent(document, "mousemove", this.#panelMouseMoveHandler);
    this.unregisterEvent(document, "mouseup", this.#panelMouseUpHandler);
    this.#x = null;
    this.#y = null;
    this.#panelCtx = null;
  }
  async #panelAnimate() {
    requestAnimationFrame(() => {
      if (this.#panelMove == false)
        return;
      this.panelSelector.style.translate = `${this.#x - 8}px ${this.#y - 8}px`;
      this.#panelAnimate();
    });
  }
  async #gradientAnimate() {
    requestAnimationFrame(() => {
      if (this.#panelMove == false)
        return;
      this.gradientSelector.style.translate = `0px ${this.#y - 4}px`;
      this.#gradientAnimate();
    });
  }
  async #gradientMouseDown(event) {
    event.preventDefault();
    this.#gradientCtx = this.gradient.getContext("2d", { willReadFrequently: true });
    this.#panelMove = true;
    this.#y = event.clientY - this.#bounds.y;
    this.registerEvent(document, "mousemove", this.#gradientMouseMoveHandler);
    this.registerEvent(document, "mouseup", this.#gradientMouseUpHandler);
    await this.#gradientAnimate();
  }
  async #gradientMouseMove(event) {
    event.preventDefault();
    const point = ptInRect({ x: event.clientX, y: event.clientY }, this.#gradientBounds);
    this.#y = point.y - this.#bounds.top;
    const rgb = this.gradient.get(1, this.#y);
    await this.panel.pushUpdate(rgb);
  }
  async #gradientMouseUp(event) {
    event.preventDefault();
    const point = ptInRect({ x: event.clientX, y: event.clientY }, this.#gradientBounds);
    this.#y = point.y - this.#bounds.top;
    const rgb = this.gradient.get(1, this.#y);
    await this.panel.pushUpdate(rgb);
    this.#panelMove = false;
    this.unregisterEvent(document, "mousemove", this.#gradientMouseMoveHandler);
    this.unregisterEvent(document, "mouseup", this.#gradientMouseUpHandler);
    this.#y = null;
    this.#x = null;
    this.#gradientCtx = null;
  }
}
function ptInRect(point, rect) {
  if (point.x < rect.x) {
    point.x = rect.x;
  }
  if (point.x > rect.right) {
    point.x = rect.right;
  }
  if (point.y < rect.y) {
    point.y = rect.y;
  }
  if (point.y > rect.bottom - 1) {
    point.y = rect.bottom - 1;
  }
  return point;
}
customElements.define("color-picker", ColorPicker);
