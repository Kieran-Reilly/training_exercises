class AvailableSelectedActions {
  static async perform(step, context, process, item) {
    await this[step.action](step, context, process, item);
  }
  /**
   * @method set_records - This action will set the records for the available and selected lists.
   * @param step {Object} - The step object in the process.
   * @param context {Object} - The context object.
   * @param process {Object} - The currently running process.
   * @param item {Object} - The item object if we are using a loop.
   * @param.step.args.element {String|HTMLElement} - The element to set the records for.
   * @param.step.args.items {Array} - The items to set.
   * @param.step.args.idField {String} - The id field to use.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript use example</caption>
   * await crs.call("available_selected", "set_records", {element, items, idField: "id"});
   *
   * @example <caption>json use example</caption>
   * {
   *    "type": "available_selected",
   *    "action": "set_records",
   *    "args": {
   *      "element": "#my-available-selected",
   *      "items": "&context.items",
   *      "idField": "id"
   *    }
   * }
   */
  static async set_records(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const items = await crs.process.getValue(step.args.items);
    const idField = element.dataset.idField || "id";
    const data = {
      available: [],
      selected: []
    };
    for (const item2 of items) {
      item2[idField] = item2[idField] || items.indexOf(item2);
      item2.selected === true ? data.selected.push(item2) : data.available.push(item2);
    }
    const onReady = async () => {
      await element.update(data);
    };
    await crs.call("component", "on_ready", { element, callback: onReady, caller: this });
  }
  /**
   * @method get_selected_records - This action will return the selected records.
   * @param step {Object} - The step object in the process.
   * @param context {Object} - The context object.
   * @param process {Object} - The currently running process.
   * @param item {Object} - The item object if we are using a loop.
   * @param.step.args.element {String|HTMLElement} - The element to get the selected records for.
   * @returns {Promise<Number>}
   *
   * @example <caption>javascript use example</caption>
   * const selectedRecords = await crs.call("available_selected", "get_selected_records", { element });
   *
   * @example <caption>json use example</caption>
   * {
   *   "type": "available_selected",
   *   "action": "get_selected_records",
   *   "args": {
   *     "element": "#my-available-selected"
   *   }
   * }
   */
  static async get_selected_records(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element);
    return await element?.getSelectedItems();
  }
}
crs.intent.available_selected = AvailableSelectedActions;
export {
  AvailableSelectedActions
};
