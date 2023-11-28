import "./actions/editing-actions.js";
import { addColumnFeatures } from "./columns.js";
import { addSelectionFeature } from "./selection.js";
import { selectedConverter } from "./value-converters/selected-converter.js";
import { enableInput, disableInput } from "./input.js";
class DataGrid extends crs.classes.BindableElement {
  #columns;
  #columnGroups;
  get shadowDom() {
    return true;
  }
  get columns() {
    return this.#columns;
  }
  get columnGroups() {
    return this.#columnGroups;
  }
  get selectionType() {
    return this.dataset.selection || "none";
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  async connectedCallback() {
    await super.connectedCallback();
    crs.binding.valueConvertersManager.add("selected", selectedConverter);
    this.#columns = [];
    this.#columnGroups = [];
    await addColumnFeatures(this);
    await addSelectionFeature(this);
    await enableInput(this);
  }
  async disconnectedCallback() {
    crs.binding.valueConvertersManager.remove("selected");
    this.#columns = null;
    this.#columnGroups = null;
    await disableInput(this);
    await super.disconnectedCallback();
  }
  /**
   * Used during double click or keyboard events to execute primary row actions
   * @param event
   * @returns {Promise<void>}
   */
  async rowExecute(event) {
    const target = event.composedPath()[0];
    if (event.ctrlKey == true) {
      return await crs.call("grid_editing", "edit", { element: target });
    }
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("row-execute", {
      bubbles: true,
      composed: true,
      detail: target
    }));
  }
  async addColumnElements(columns) {
    dispatchEvent(new CustomEvent("columns-added", {
      bubbles: true,
      composed: true,
      detail: this
    }));
  }
  async modifyRecord(rowIndex, field, value, convert) {
    if (convert != null) {
      value = await crs.binding.valueConvertersManager.convert(value, convert.converter, "set", convert.parameter);
    }
  }
}
customElements.define("data-grid", DataGrid);
export {
  DataGrid as default
};
