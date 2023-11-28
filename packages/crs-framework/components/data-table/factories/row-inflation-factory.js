import { DataTableExtensions } from "../data-table-extensions.js";
async function rowInflationFactory(table, columns, idField) {
  const code = [`rowElement.dataset.id = model["${idField ?? "id"}"];`];
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    code.push(`rowElement.children[${i}].textContent = model["${column.property}"];`);
  }
  await table.callExtension(DataTableExtensions.FORMATTING.name, "createFormattingCode", code);
  return new crs.classes.AsyncFunction("model", "rowElement", code.join("\n"));
}
export {
  rowInflationFactory
};
