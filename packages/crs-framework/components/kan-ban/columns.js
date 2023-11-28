function addColumnFeatures(instance) {
  instance.addColumnElements = addColumnElements;
  instance.removeColumnElements = removeColumnElements;
}
async function addColumnElements(columns) {
  let index = 0;
  for (const column of columns) {
    const header = await crs.call("dom", "create_element", {
      tag_name: "crs-widget",
      text_content: column.title,
      id: column.id,
      attributes: {
        "data-name": column.title,
        role: "columnheader"
      }
    });
    this.header.appendChild(header);
    const cell = await crs.call("dom", "create_element", {
      id: index,
      attributes: {
        role: "cell"
      },
      dataset: {
        index
      }
    });
    column.container = cell;
    this.container.appendChild(cell);
    index += 1;
  }
  dispatchEvent(new CustomEvent("columns-added", {
    bubbles: true,
    composed: true,
    detail: this
  }));
}
async function removeColumnElements(index, count) {
  dispatchEvent(new CustomEvent("columns-removed", {
    bubbles: true,
    composed: true,
    detail: this
  }));
}
async function moveColumnElement(from, to) {
  dispatchEvent(new CustomEvent("columns-moved", {
    bubbles: true,
    composed: true,
    detail: this
  }));
}
export {
  addColumnFeatures
};
