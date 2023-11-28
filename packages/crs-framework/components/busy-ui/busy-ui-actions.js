import "./busy-ui.js";
class BusyUIActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  /**
   * @method show - Show a busy indicator for a specific element.
   * @param step {object} - the process step.
   * @param context {object} - the process context.
   * @param process {object} - the process.
   * @param item {object} - the process item.
   * @returns {Promise<void>}
   *
   * @param step.args.element {HTMLElement} - the element to show the busy indicator for.
   * @param step.args.message {string} - the message to show in the busy indicator.
   *
   * @example <caption>javascript example</caption>
   * await crs.call("busy_ui", "show", {
   *    "element": "#my-element",
   *    "message": "Loading..."
   * });
   *
   * @example <caption>json example</caption>
   * {
   *   "type": "busy_ui",
   *   "action": "show",
   *   "args": {
   *      "element": "#my-element",
   *      "message": "Loading..."
   *   }
   * }
   */
  static async show(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const message = await crs.process.getValue(step.args.message || "", context, process, item);
    const progress = await crs.process.getValue(step.args.progress || "", context, process, item);
    if (element == null) {
      return console.error(`busy-ui, unable to find element ${step.args.element}`);
    }
    ensureElementRelative(element);
    const hasElement = element.querySelector("busy-ui") != null;
    if (hasElement)
      return;
    const busyElement = document.createElement("busy-ui");
    busyElement.dataset.message = message;
    busyElement.dataset.progress = progress;
    element.appendChild(busyElement);
  }
  static async update(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const message = await crs.process.getValue(step.args.message || "", context, process, item);
    const progress = await crs.process.getValue(step.args.progress || "", context, process, item);
    const busyElement = element.querySelector("busy-ui");
    if (busyElement != null) {
      busyElement.dataset.message = message;
      busyElement.dataset.progress = progress;
    }
  }
  /**
   * @method hide - Hide a busy indicator for a specific element.
   * @param step {object} - the process step.
   * @param context {object} - the process context.
   * @param process {object} - the process.
   * @param item {object} - the process item.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("busy_ui", "hide", {
   *   "element": "#my-element"
   * });
   */
  static async hide(step, context, process, item) {
    const element = await crs.dom.get_element(step.args.element, context, process, item);
    const busyElement = element.querySelector("busy-ui");
    if (busyElement) {
      busyElement.remove();
    }
  }
}
function ensureElementRelative(element) {
  const styles = window.getComputedStyle(element);
  const position = styles.getPropertyValue("position");
  if (position !== "relative" && position !== "absolute") {
    element.style.position = "relative";
  }
}
crs.intent.busy_ui = BusyUIActions;
export {
  BusyUIActions
};
