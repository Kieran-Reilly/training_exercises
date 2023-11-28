async function addColumnFeatures(instance) {
  instance.addColumnElements = addColumnElements;
  instance.removeColumnElements = removeColumnElements;
}
async function addColumnElements(columns) {
  for (const column of columns) {
    const header = await crs.call("dom", "create_element", {
      text_content: column.title,
      attributes: {
        role: "columnheader"
      },
      styles: column.styles,
      classes: column.classes
    });
    this.rowContainer.parentElement.insertBefore(header, this.rowContainer);
  }
  dispatchEvent(new CustomEvent("columns-added", { composed: true, bubbles: true, detail: this }));
}
async function removeColumnElements(index, count) {
  dispatchEvent(new CustomEvent("columns-removed", { composed: true, bubbles: true, detail: this }));
}
async function moveColumnElement(from, to) {
  dispatchEvent(new CustomEvent("columns-moved", { composed: true, bubbles: true, detail: this }));
}
export {
  addColumnFeatures
};
