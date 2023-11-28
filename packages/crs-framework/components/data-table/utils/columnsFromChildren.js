async function columnsFromChildren(table, columnsManager) {
  const columns = [];
  const columnElements = table.querySelectorAll("column");
  for (let columnElement of columnElements) {
    columns.push({
      title: columnElement.dataset.heading,
      width: columnElement.dataset.width,
      property: columnElement.dataset.property,
      dataType: columnElement.dataset.type || "string"
    });
  }
  columnsManager.set(columns);
}
export {
  columnsFromChildren
};
