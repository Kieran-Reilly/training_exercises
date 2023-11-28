class ColorPanel extends HTMLCanvasElement {
  #rgba;
  #ctx;
  static get observedAttributes() {
    return ["value"];
  }
  async connectedCallback() {
    this.#rgba = "rgba(255,0,0,1)";
    requestAnimationFrame(() => {
      const style = getComputedStyle(this);
      this.width = Number(style.width.replace("px", ""));
      this.height = Number(style.height.replace("px", ""));
      this.#ctx = this.getContext("2d", { willReadFrequently: true });
      this.#fillGradient();
    });
  }
  async disconnectedCallback() {
    this.#rgba = null;
    this.#ctx = null;
  }
  #fillGradient() {
    if (this.#ctx == null)
      return;
    this.#ctx.fillStyle = this.#rgba;
    this.#ctx.fillRect(0, 0, this.width, this.height);
    const white = this.#ctx.createLinearGradient(0, 0, this.width, 0);
    white.addColorStop(0, "rgba(255,255,255,1)");
    white.addColorStop(1, "rgba(255,255,255,0)");
    this.#ctx.fillStyle = white;
    this.#ctx.fillRect(0, 0, this.width, this.height);
    const black = this.#ctx.createLinearGradient(0, 0, 0, this.height);
    black.addColorStop(0, "rgba(0,0,0,0)");
    black.addColorStop(1, "rgba(0,0,0,1)");
    this.#ctx.fillStyle = black;
    this.#ctx.fillRect(0, 0, this.width, this.height);
  }
  async attributeChangedCallback(name, oldValue, newValue) {
    const rgb = await crs.call("colors", "hex_to_rgb", { hex: newValue });
    this.#rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    this.#fillGradient();
  }
  async pushUpdate(rgb) {
    this.#rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    this.#fillGradient();
  }
  get(x, y) {
    const data = this.#ctx.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }
}
customElements.define("color-panel", ColorPanel, { extends: "canvas" });
