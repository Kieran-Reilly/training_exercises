function createRowInflation(grid, idField, rowFormatting, cellFormatting) {
  const code = [
    `element.setAttribute("data-id", model.${idField})`
  ];
  createConditionalProperties(rowFormatting, code, "element");
  for (let i = 0; i < grid.columns.length; i++) {
    const column = grid.columns[i];
    if (cellFormatting[column.field] != null) {
      createConditionalProperties(cellFormatting[column.field], code, `element.children[${i}]`);
    }
    code.push(`element.children[${i}].dataset.field = "${column.field}";`);
    if (column.convert != null) {
      const target = column.html == true ? "innerHTML" : "textContent";
      code.push(`element.children[${i}].${target} = crs.binding.valueConvertersManager.convert(model.${column.field}, "${column.convert.converter}", "get")`);
    } else {
      code.push(`element.children[${i}].textContent = model.${column.field}`);
    }
  }
  const fn = new Function("element", "model", code.join("\n"));
  grid.rowInflateFn = fn;
}
async function createRowElement(grid, inflateFn, model, index, top, height) {
  const rowElement = await crs.call("dom", "create_element", {
    parent: grid.rowContainer,
    attributes: {
      role: "row"
    },
    styles: {
      height,
      translate: `0 ${top}`
    },
    dataset: {
      index
    }
  });
  for (const column of grid.columns) {
    const cell = await crs.call("dom", "create_element", {
      parent: rowElement,
      attributes: {
        role: "gridcell"
      },
      styles: column.styles,
      classes: column.classes
    });
    if (column.align != null) {
      cell.classList.add(column.align);
    }
  }
  inflateFn(rowElement, model);
}
function createConditionalProperties(obj, code, elementCode) {
  const keys = Object.keys(obj || {});
  for (const key of keys) {
    code.push(`if (${key}) {`);
    const props = Object.keys(obj[key]);
    for (const prop of props) {
      code.push(`    ${elementCode}.style.${prop} = "${obj[key][prop]}"`);
    }
    code.push("}");
  }
}
export {
  createRowElement,
  createRowInflation
};
