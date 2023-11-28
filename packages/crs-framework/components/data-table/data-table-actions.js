import "./data-table.js";
import { DataTableExtensions } from "./data-table-extensions.js";
class DataTableActions {
  static async perform(step, context, process, item) {
    let action = DataTableActions[step.action];
    if (action) {
      return action(step, context, process, item);
    }
  }
  /**
   * @method set_columns - change what columns show in the data table.
   * @param step
   * @param context
   * @param process
   * @param item
   *
   * @param step.args.element - The data table element to set the columns on.
   * @param step.args.columns - The columns to set on the element.
   * @returns {Promise<void>}
   */
  static async set_columns(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const columns = await crs.process.getValue(step.args.columns, context, process, item);
  }
  /**
   * @method set_formatter - set the formatter for the data table.
   * @param step {object} - The step object from the process definition
   * @param context {object} - The context of the current process.
   * @param process {object} - The process object that is currently running.
   * @param item {object} - The item that is being processed.
   *
   * @param step.args.element - The data table element to set the formatter on.
   * @param step.args.settings - The settings to set on the formatter.
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_table", "set_formatter", { element: "#my-table", settings: {
   *     row: [{
   *         "condition": "item.id === 1",
   *         "classes": ["my-class"],
   *         "styles": {
   *             "background-color": "red"
   *         }
   *     }],
   *     column: {
   *         "code": [
   *             {
   *                 "classes": ["my-class"],
   *                 styles: { ... }
   *             },
   *             {
   *                 "condition": "item.id === 1",
   *                 "classes": ["my-class"],
   *                 "styles": { ... }
   *             }
   *         ]
   *     }
   * } });
   */
  static async set_formatter(step, context, process, item) {
    const element = await crs.process.getValue(step.args.element, context, process, item);
    const settings = await crs.process.getValue(step.args.settings, context, process, item);
    const enabled = await crs.process.getValue(step.args.enabled ?? true, context, process, item);
    await element.setExtension(DataTableExtensions.FORMATTING.name, settings, enabled);
    if (element.dataset.ready === "true") {
      await element.updateInflation();
    }
  }
  static async set_editing(step, context, process, item) {
    const element = await crs.process.getValue(step.args.element, context, process, item);
    const enabled = await crs.process.getValue(step.args.enabled, context, process, item);
    await element.setExtension(DataTableExtensions.CELL_EDITING.name, null, enabled);
  }
  static async set_resize(step, context, process, item) {
    const element = await crs.process.getValue(step.args.element, context, process, item);
    const enabled = await crs.process.getValue(step.args.enabled, context, process, item);
    await element.setExtension(DataTableExtensions.RESIZE.name, null, enabled);
  }
  static async set_filter(step, context, process, item) {
    const element = await crs.process.getValue(step.args.element, context, process, item);
    const enabled = await crs.process.getValue(step.args.enabled, context, process, item);
    const settings = await crs.process.getValue(step.args.settings, context, process, item);
    await element.setExtension(DataTableExtensions.FILTER.name, settings, enabled);
  }
}
crs.intent.data_table = DataTableActions;
