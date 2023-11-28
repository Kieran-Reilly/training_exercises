function rowFactory(columns, idField) {
  const code = [
    'const row = document.createElement("div");',
    'row.role = "row";',
    `row.dataset.id = item["${idField ?? "id"}"];`,
    "let element;"
  ];
  for (const column of columns) {
    code.push(`element = document.createElement("div");`);
    code.push(`element.textContent = item["${column.property}"];`);
    code.push(`element.role = "cell";`);
    code.push(`element.dataset.field = "${column.property}";`);
    code.push(`row.appendChild(element);`);
  }
  code.push("parent.appendChild(row);");
  code.push("return row;");
  return new crs.classes.AsyncFunction("item", "parent", code.join("\n"));
}
export {
  rowFactory
};
