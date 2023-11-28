class ColorGradient extends HTMLCanvasElement {
  #ctx;
  async connectedCallback() {
    requestAnimationFrame(() => {
      const style = getComputedStyle(this);
      this.width = Number(style.width.replace("px", ""));
      this.height = Number(style.height.replace("px", ""));
      this.#fillGradient();
    });
  }
  async disconnectedCallback() {
    this.#ctx = null;
  }
  #fillGradient() {
    this.#ctx = this.getContext("2d", { willReadFrequently: true });
    this.#ctx.rect(0, 0, this.width, this.height);
    const gradient = this.#ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
    gradient.addColorStop(0.17, "rgba(255, 255, 0, 1)");
    gradient.addColorStop(0.34, "rgba(0, 255, 0, 1)");
    gradient.addColorStop(0.51, "rgba(0, 255, 255, 1)");
    gradient.addColorStop(0.68, "rgba(0, 0, 255, 1)");
    gradient.addColorStop(0.85, "rgba(255, 0, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
    this.#ctx.fillStyle = gradient;
    this.#ctx.fill();
  }
  get(x, y) {
    const data = this.#ctx.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }
}
customElements.define("color-gradient", ColorGradient, { extends: "canvas" });
