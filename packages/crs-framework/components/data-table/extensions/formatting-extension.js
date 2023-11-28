import { DataTableExtensions } from "./../data-table-extensions.js";
class FormattingExtension {
  #settings;
  #table;
  constructor(table, settings) {
    this.#settings = settings;
    this.#table = table;
  }
  dispose() {
    this.#settings = null;
    this.#table = null;
    return DataTableExtensions.FORMATTING.path;
  }
  #createRowCode(code) {
    if ((this.#settings.rows ?? []).length === 0) {
      return;
    }
    this.#createPaintCode(code, this.#settings.rows, "rowElement");
  }
  #createCellCode(code) {
    if (this.#settings.columns == null) {
      return;
    }
    code.push("let cellElement;");
    for (const columnName of Object.keys(this.#settings.columns)) {
      const columnSettings = this.#settings.columns[columnName];
      code.push("cellElement = rowElement.children[" + this.#table.getColumnIndex(columnName) + "];");
      code.push("cellElement.classList = [];");
      this.#createPaintCode(code, columnSettings, "cellElement");
    }
  }
  /**
   * @method #createPaintCode - create the code to apply the formatting to the data table.
   * @param code {Array} - The code to add the formatting code to.
   * @param settings {Array} - The settings to apply to the data table.
   * @param prefix {string} - The prefix to use for the code indicating the element to use.
   */
  #createPaintCode(code, settings, prefix) {
    const resetStyleCode = /* @__PURE__ */ new Set();
    const applyStyleCode = [];
    for (const setting of settings) {
      clearStylesCode(setting.styles, `${prefix}`, resetStyleCode);
      if (setting.condition != null) {
        applyStyleCode.push(`if (${setting.condition}) {`);
        classesToCode(setting.classes, `    ${prefix}`, applyStyleCode);
        stylesToCode(setting.styles, `    ${prefix}`, applyStyleCode);
        applyStyleCode.push("}");
        continue;
      }
      classesToCode(setting.classes, prefix, applyStyleCode);
      stylesToCode(setting.styles, prefix, applyStyleCode);
    }
    const resetStyleCodeArray = Array.from(resetStyleCode);
    code.push(...resetStyleCodeArray, ...applyStyleCode);
  }
  /**
   * @method createFormattingCode - create the code to apply the formatting to the data table.
   * @param code {Array} - The code to add the formatting code to.
   * @returns {Promise<void>}
   */
  createFormattingCode(code) {
    code.push(`rowElement.classList = [];`);
    this.#createRowCode(code);
    this.#createCellCode(code);
  }
}
function classesToCode(classes, prefix, code) {
  classes ||= [];
  for (const cls of classes) {
    code.push(`${prefix}.classList.add("${cls}");`);
  }
}
function stylesToCode(styles, prefix, code) {
  styles ||= "";
  if (styles.length === 0) {
    return;
  }
  styles = styles.split(";");
  for (const style of styles) {
    const parts = style.split(":");
    if (parts.length > 1) {
      code.push(`${prefix}.style["${parts[0].trim()}"] = "${parts[1].trim()}";`);
    }
  }
}
function clearStylesCode(styles, prefix, code) {
  styles ||= "";
  if (styles.length === 0) {
    return;
  }
  styles = styles.split(";");
  for (const style of styles) {
    const parts = style.split(":");
    if (parts.length > 1) {
      code.add(`${prefix}.style["${parts[0].trim()}"] = "";`);
    }
  }
}
export {
  FormattingExtension as default
};
