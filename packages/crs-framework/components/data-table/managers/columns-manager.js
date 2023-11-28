class ColumnsManager {
  #widths = [];
  #columns = [];
  /**
   * @property gridTemplateColumns - css grid template columns
   * @returns {string}
   */
  get gridTemplateColumns() {
    return this.#widths.map((item) => `${item}px`).join(" ");
  }
  /**
   * @property columns - array of columns objects
   * @returns {*[]}
   */
  get columns() {
    return this.#columns;
  }
  /**
   * @method dispose - free memory
   */
  dispose() {
    this.#widths.length = 0;
    this.#columns.length = 0;
    return null;
  }
  /**
   * @method set - set the columns
   * @param columns {Array} - array of columns objects
   */
  set(columns) {
    this.#widths.length = 0;
    this.#columns.length = 0;
    for (const column of columns) {
      this.#widths.push(column.width);
      this.#columns.push(column);
    }
  }
  /**
   * @method append - add a column to the manager at the end of the list
   * @param title {string} - column title, can be a translation key, will be translated on adding to manager
   * @param width {number} - column width in pixels
   * @param property {string} - property name of the data object
   * @returns {Promise<void>}
   */
  async append(title, width, property) {
    if (title.indexOf("&{") !== -1) {
      title = await crs.binding.translations.get_with_markup(title);
    }
    this.#widths.push(width);
    this.#columns.push({ title, width, property });
  }
  /**
   * @method insert - insert a column to the manager at the specified index
   * @param index {number} - index to insert the column
   * @param title {string} - column title, can be a translation key, will be translated on adding to manager
   * @param width {number} - column width in pixels
   * @param property {string} - property name of the data object
   * @returns {Promise<void>}
   */
  async insert(index, title, width, property) {
    if (!validIndex(this.#widths, index)) {
      return this.append(title, width, property);
    }
    if (title.indexOf("&{") !== -1) {
      title = await crs.binding.translations.get_with_markup(title);
    }
    this.#widths.splice(index, 0, width);
    this.#columns.splice(index, 0, { title, width, property });
  }
  /**
   * @method remove - remove a column from the manager at the specified index
   * @param index {number} - index to remove the column
   * @returns {Promise<void>}
   */
  async remove(index) {
    if (!validIndex(this.#widths, index))
      return;
    this.#widths.splice(index, 1);
    this.#columns.splice(index, 1);
  }
  /**
   * @method move - move a column from one index to another
   * @param from {number} - index to move the column from
   * @param to {number} - index to move the column to
   * @returns {Promise<void>}
   */
  async move(from, to) {
    if (!validIndex(this.#widths, from) || !validIndex(this.#widths, to))
      return;
    const width = this.#widths[from];
    const column = this.#columns[from];
    this.#widths.splice(from, 1);
    this.#columns.splice(from, 1);
    this.#widths.splice(to, 0, width);
    this.#columns.splice(to, 0, column);
  }
  /**
   * @method resize - set the width of a column
   * @param index {number} - index of the column to resize
   * @param width {number} - new width of the column
   * @returns {Promise<void>}
   */
  async resize(index, width) {
    if (!validIndex(this.#widths, index))
      return;
    this.#widths[index] = width;
    this.#columns[index].width = width;
  }
  /**
   * @method getColumnIndex - get the index of a column by property name
   * @param property {string} - property name of the column
   * @returns {number}
   */
  getColumnIndex(property) {
    return this.#columns.findIndex((item) => item.property === property);
  }
}
function validIndex(collection, index) {
  return index >= 0 && index < collection.length;
}
export {
  ColumnsManager
};
