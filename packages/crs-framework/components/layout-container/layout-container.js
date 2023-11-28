class LayoutContainer extends HTMLElement {
  async connectedCallback() {
    await this.#renderGrid();
  }
  async #renderGrid() {
    const columns = this.dataset.columns;
    const rows = this.dataset.rows;
    if (columns == null && rows == null)
      return;
    await crs.call("cssgrid", "init", {
      element: this
    });
    await crs.call("cssgrid", "set_columns", {
      element: this,
      columns
    });
    await crs.call("cssgrid", "set_rows", {
      element: this,
      rows
    });
  }
}
customElements.define("layout-container", LayoutContainer);
export {
  LayoutContainer as default
};
