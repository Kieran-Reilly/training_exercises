import { DataTableExtensions } from "./../data-table-extensions.js";
class CellEditingExtension {
  #settings;
  #table;
  constructor(table, settings) {
    this.#settings = settings;
    this.#table = table;
  }
  dispose() {
    this.#settings = null;
    this.#table = null;
    return DataTableExtensions.CELL_EDITING.path;
  }
  /**
   * @method toggleEditing - toggle the editing state of the cell.
   * If a cell is not in edit state then add edit features.
   * If the cell is already being edited then update the value and exit edit state.
   */
  toggleEditing(cellElement) {
  }
}
export {
  CellEditingExtension as default
};
