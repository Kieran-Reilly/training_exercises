import "./context-loader.js";
class ContextMenuActions {
  static async perform(step, context, process, item) {
    await this[step.action](step, context, process, item);
  }
  /**
   * @method show - Show a context menu
   * @param step {Object} - The step object in a process
   * @param context {Object} - The context object
   * @param process {Object} - The process object
   * @param item {Object} - The item object if in a loop
   *
   * @param step.args.element {String} - The element to position the context menu relative to.
   * @param step.args.options {Array} - An array of options to display in the context menu.
   * @param [step.args.point] {Object} - The point to position the context menu at.
   * @param [step.args.at] {String} - The position of the context menu relative to the point. (top, bottom, left, right)
   * @param [step.args.anchor] {String} - The position of the point relative to the context menu. (top, bottom, left, right)
   * @param [step.args.target] {HTMLElement} - The target element to position the context menu relative to.
   * @param [step.args.context] {Object} - The context to use when inflating the context menu. used to execute a process with the menu item.
   * @param [step.args.process] {String} - The process to call when an option is selected. used to execute a process with the menu item.
   * @param [step.args.item] {Object} - The item to pass to the process when an option is selected. used to execute a process with the menu item.
   * @param [step.args.margin] {Number} - The margin to use when positioning the context menu.
   * @param [step.args.callback] {Function} - The callback to call when an option is selected.
   * @param [step.args.templates] {Object} - The templates to use when inflating the context menu.
   *
   * @returns {Promise<void>}
   *
   * Relative to a component:
   * - set target to the component
   * - set at to the location of the context menu relative to the component
   * - set anchor to align the menu to the component. for example if align is "top" the top of the component and the top of the menu will be the same.
   * - set margin to the distance between the component and the menu.
   *
   * Relative to a point:
   * - set point to the point to position the menu at.
   *
   * @example <caption>javascript option - separator</caption>
   * { title: "-" }
   *
   * @example <caption>javascript option - process</caption>
   * {
   *      id: "item2", // id of the option
   *      title: "Browse", // display text of the option
   *      type: "console", // process action type
   *      action: "log", // process action
   *      args: { message: "Browse "} // process action arguments
   * }
   *
   * @example <caption>javascript option - with custom icons and styles</caption>
   * {
   *     id: "item2",
   *     title: "Browse",
   *     icon: "fas fa-folder-open", // icon name as found in font (see icon_font_family in show example)
   *     icon_color: "blue", // color of the icon
   *     styles: { "background": "green"} // any style properties you want to set on the menu item
   *     tags: "approved", // search tags used for filtering list
   * }
   *
   * @example <caption>javascript option - hierarchical</caption>
   * {
   *    id: "item2",
   *    title: "Browse",
   *    children: [ ... list of options with their own children ... ]
   * }
   *
   * @example <caption>javascript example - show menu relative to a component</caption>
   * crs.call("context_menu", "show", {
   *    element: this,
   *    icon_font_family: "crsfrw",
   *    at: "bottom",
   *    anchor: "top",
   *    margin: 10,
   *    options: [ ... see above "option" examples ... ]
   * }
   *
   * @example <caption>javascript example - show menu at a given point</caption>
   * crs.call("context_menu", "show", {
   *   icon_font_family: "crsfrw",
   *   point: { x: 100, y: 100 },
   *   options: [ ... see above "option" examples ... ]
   * }
   */
  static async show(step, context, process, item) {
    const target = await crs.dom.get_element(step.args.element, context, process, item);
    const options = await crs.process.getValue(step.args.options, context, process, item);
    const at = await crs.process.getValue(step.args.at, context, process, item);
    const anchor = await crs.process.getValue(step.args.anchor, context, process, item);
    const point = await crs.process.getValue(step.args.point, context, process, item);
    const margin = await crs.process.getValue(step.args.margin, context, process, item);
    const callback = await crs.process.getValue(step.args.callback, context, process, item);
    const templates = await crs.process.getValue(step.args.templates, context, process, item);
    if (globalThis.contextMenu != null) {
      await this.close();
    }
    const icon_font_family = await crs.process.getValue(step.args.icon_font_family, context, process, item);
    const height = await crs.process.getValue(step.args.height, context, process, item);
    const instance = document.createElement("context-menu");
    instance.setOptions({
      options,
      templates,
      point,
      target,
      at,
      anchor,
      context,
      margin,
      height,
      style: {
        "--icon-font": icon_font_family
      }
    });
    document.body.appendChild(instance);
    if (callback != null) {
      const fn = (event) => {
        instance.removeEventListener("change", fn);
        callback(event);
      };
      instance.addEventListener("change", fn);
    }
    globalThis.contextMenu = instance;
  }
  /**
   * @method close - Closes the context menu.
   * There is only one context menu open at any time so this will close the current context menu.
   * @returns {Promise<void>}
   */
  static async close() {
    if (globalThis.contextMenu == null)
      return;
    globalThis.contextMenu.parentElement.removeChild(globalThis.contextMenu);
    delete globalThis.contextMenu;
  }
}
crs.intent.context_menu = ContextMenuActions;
export {
  ContextMenuActions
};
