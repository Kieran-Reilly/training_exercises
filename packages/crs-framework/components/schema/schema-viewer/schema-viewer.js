class SchemaViewer extends HTMLElement {
  async set_schema(id, schema) {
    this.innerHTML = await crs.call("schema", "parse", { id, schema });
  }
}
customElements.define("schema-viewer", SchemaViewer);
