import "./toast-notification.js";
class ToastNotificationActions {
  /**
   * The function then looks up the action in the `ToastNotificationActions` object and calls the function.
   * @param step - The step object from the process definition
   * @param context - The context of the current process.
   * @param process - The process object that is currently running.
   * @param item - The item that is being processed.
   * @returns The action function is being returned.
   */
  static async perform(step, context, process, item) {
    let action = ToastNotificationActions[step.action];
    if (action) {
      return action(step, context, process, item);
    }
  }
  /**
   * It creates a toast notification element and adds it to the body of the page
   * @param step - the step object
   * @param context - The context of the current step.
   * @param process - the process that is running
   * @param item - The item that is being processed.
   *
   * @param [step.args.position=bottom-center] - The position of the toast notification element
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("toast_notification", "enable", { position: "bottom-center" });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "toast_notification",
   *     "action": "enable",
   *     "args": {
   *         "position": "bottom-center"
   *     }
   * }
   */
  static async enable(step, context, process, item) {
    return new Promise(async (resolve) => {
      const position = await crs.process.getValue(step.args.position ?? "bottom-center", context, process, item);
      const margin = await crs.process.getValue(step.args.margin ?? 0, context, process, item);
      const element = document.createElement("toast-notification");
      element.dataset.position = position;
      element.dataset.margin = margin;
      document.body.appendChild(element);
      element.style.visibility = "hidden";
      await crs.call("fixed_position", "set", { element, position, margin });
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        element.style.visibility = "visible";
        resolve();
      }, 300);
    });
  }
  /**
   * It removes the toast notification from the DOM
   *
   * @example <caption>javascript example</caption>
   * await crs.call("toast_notification", "disable", {});
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "toast_notification",
   *    "action": "disable",
   *    "args": {}
   * }
   */
  static async disable() {
    const element = document.querySelector("toast-notification");
    document.body.removeChild(element);
  }
  /**
   * It shows a toast notification with the specified message, duration, severity and action.
   * @param step - The step object from the process definition.
   * @param context - The context of the process.
   * @param process - The process object
   * @param item - The item that is being processed.
   *
   * @param [step.args.duration=1000] - The duration in milliseconds that the toast notification will be displayed.
   * @param step.args.message - The message to display.
   * @param step.args.severity - The severity of the toast notification.
   * @param step.args.action - The action to perform when the action button is clicked.
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("toast_notification", "show", {
   *    duration: 5000,
   *    message: "This is a toast notification",
   *    severity: "info", "success", "warning", "error"
   *    action: () => { console.log("done") }
   * }, context, process, item);
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "toast_notification",
   *     "action": "show",
   *     "args": {
   *          "duration": 5000,
   *          "message": "This is a toast notification",
   *          "severity": "info",
   *          "action": "$context.action"
   *      }
   * }
   */
  static async show(step, context, process, item) {
    const duration = await crs.process.getValue(step.args.duration ?? 5e3, context, process, item);
    const message = await crs.process.getValue(step.args.message, context, process, item);
    const severity = await crs.process.getValue(step.args.severity, context, process, item);
    const action = await crs.process.getValue(step.args.action, context, process, item);
    const element = document.querySelector("toast-notification");
    if (element == null) {
      console.error("toast-notification element not found");
    }
    element.show(duration, message, severity, action).catch((e) => console.error(e));
  }
}
crs.intent.toast_notification = ToastNotificationActions;
