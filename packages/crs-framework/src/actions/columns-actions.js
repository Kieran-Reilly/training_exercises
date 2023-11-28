class ColumnsActions {
  static #columnsProperty = "--columns";
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  /**
   * Add a collection of columns to the element
   * @param element
   * @param columns
   *
   * a column = {
   *     id: "id of the column",
   *     title: "column title",
   *     field: predefinedValueValue:udf()
   *     width: 100
   *     type: <optional>"string", "number", "date", "duration" - default "string"
   *     align: <optional> "left", "right", "middle" - default = left
   * }
   */
  static async add_columns(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const columns = await crs.process.getValue(step.args.columns, context, process, item);
    addToCollection(element.columns, columns);
    writeCSSColumns(element, this.#columnsProperty, element.columns);
    await element.addColumnElements?.(columns);
  }
  /**
   * Remove a column from a certain index
   * @param element
   * @param index
   * @param count: <optional>
   */
  static async remove_columns(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const count = await crs.process.getValue(step.args.count, context, process, item) || 1;
    const removed = element.columns.splice(index, count);
    writeCSSColumns(element, this.#columnsProperty, element.columns);
    for (const column of removed) {
      column.convert.fn = null;
      column.convert = null;
    }
    await element.removeColumnElements?.(index, count);
  }
  /**
   * Move a column from the "from" index to the "too" index
   * @param element
   * @param from
   * @param too
   * @returns {Promise<void>}
   */
  static async move_columns(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const from = await crs.process.getValue(step.args.from, context, process, item);
    const to = await crs.process.getValue(step.args.to, context, process, item);
    await element.moveColumnElement(from, to);
  }
  /**
   * Reset the element columns so that there are none
   * @param element
   * @returns {Promise<void>}
   */
  static async clear_columns(step, context, process, item) {
  }
  /**
   * Add a collection of groups to the element
   * @param element
   * @param groups
   *
   * a group = {
   *      title: "group title",
   *      index: column index to start
   *      span: how many columns does it span
   * }
   */
  static async add_groups(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const groups = await crs.process.getValue(step.args.groups, context, process, item);
    addToCollection(element.columnGroups, groups);
  }
  /**
   * Remove a column group from a certain index
   * @param element
   * @param index
   * @param count: <optional>
   */
  static async remove_group(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const count = await crs.process.getValue(step.args.count, context, process, item) || 1;
    element.columnGroups.splice(index, count);
  }
  /**
   * Move a column group from the "from" index to the "too" index
   * @param element
   * @param from
   * @param too
   * @returns {Promise<void>}
   */
  static async move_group(step, context, process, item) {
  }
  /**
   * set the width of the css variable
   * @param element
   * @param index
   * @param width
   */
  static async set_width(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const width = await crs.process.getValue(step.args.width, context, process, item);
    element.columns[index].width = width;
  }
}
function addToCollection(collection, items) {
  for (const item of items) {
    if (item.field.indexOf(":") != -1) {
      item.convert = crs.binding.utils.getConverterParts(item.field);
      if (item.convert.postExp != null) {
        const code = `return crs.binding.valueConvertersManager.convert(value, "${item.convert.converter}", "get")`;
        item.convert.fn = new Function("value", code);
      }
      item.field = item.convert.path;
    }
    collection.push(item);
  }
}
function writeCSSColumns(element, property, value) {
  value = value.map((item) => `${item.width}px`).join(" ");
  element.style.setProperty(property, value);
}
crs.intent.grid_columns = ColumnsActions;
export {
  ColumnsActions
};
