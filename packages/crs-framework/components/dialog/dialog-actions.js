import "./dialog.js";
class DialogActions {
  /**
   * @method defineSizes - define the sizes for the dialog and is called during initial application setup.
   * @param step {object} - the process step.
   * @param context {object} - the binding context.
   * @param process {object} - the current process.
   * @param item {object} - the current item in the process if in a loop.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("dialog", "defineSizes", {
   *     "auto": {
   *         "width": "max-content",
   *         "height": "max-content"
   *     },
   *     "small": {
   *         "width": "300px",
   *         "height": "max-content"
   *     },
   *     "medium": {
   *         // I don't know the size yet, but call this function to calculate the size.
   *         "callback": () => { width: "500px", height: "800px" },
   *     }
   * });
   */
  static async defineSizes(step, context, process, item) {
    globalThis.dialogSizes ||= {};
    Object.assign(globalThis.dialogSizes, step.args);
  }
  /**
   * @method show - show the dialog.
   * @param step {object} - the process step.
   * @param context {object} - the binding context.
   * @param process {object} - the current process.
   * @param item {object} - the current item in the process if in a loop.
   *
   * @param step.args.header {HTMLElement} - the header element to show in the dialog header.
   * @param step.args.main {HTMLElement} - the main element to show as the dialog main content.
   * @param step.args.footer {HTMLElement} - the footer element to show in the dialog footer, normally toolbar actions.
   * @param step.args.title {string} - the title to show in the dialog header.
   *
   * Optional:
   * @param step.args.target {HTMLElement} - the element to show the dialog relative to this target, if not defined it shows in the middle of screen.
   * @param step.args.position {string} - the position of the dialog relative to the target element -
   * only required if you have defined a target.
   * options are: "left", "right", "top", "bottom"
   *
   * @param step.args.anchor {string} - the anchor of the dialog relative to the target element - only required if you have defined a target.
   * options are: "left", "right", "top", "bottom"
   *
   * @param step.args.size {string} - the size of the dialog - based on the sizes registered with the defineSizes action.
   * Use the key of the size. "auto" is default even if not defined.
   *
   * @param step.args.margin {number} - the margin between the dialog and the target element.
   * @param step.args.close {boolean} - if true, the dialog is closed before showing the new content.
   * @param step.args.auto_close {boolean} - if true, the dialog is closed when the user clicks outside the dialog.
   * @param step.args.allow_resize {boolean} - if true, the dialog can be resized by the user.
   * @param step.args.allow_move {boolean} - if true, the dialog can be moved by the user.
   * @param step.args.min_width {number} - the minimum width of the dialog, the dialog cannot be resized smaller than this.
   * @param step.args.min_height {number} - the minimum height of the dialog, the dialog cannot be resized smaller than this.
   * @param step.args.show_header {boolean} - if true, the dialog header is shown, if false allow_move has no effect.
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("dialog", "show", {
   *     // optional
   *     target: document.querySelector("#myElement"),
   *     position: "left",
   *     anchor: "top",
   *     size: "auto",
   *     margin: 10,
   *
   *     // required
   *     header: headerElement - if null, default header is shown.
   *     main: mainElement - required
   *     footer: footerElement - if null, footer is hidden.
   *
   *     // optional
   *     title: "My Title" - used instead of the header element as an alternative
   *     close: true - by default this is true and the old dialog is closed and a new one opened.
   *     if close is false, the new content is added to the stack and closing the dialog will return to the previous one.
   *     auto_close: true - the dialog is closed when the user clicks outside the dialog.
   *     allow_resize: true - the dialog can be resized by the user.
   *     allow_move: true - the dialog can be moved by the user.
   *     min_width: 100 - the minimum width of the dialog, the dialog cannot be resized smaller than this.
   *     min_height: 100 - the minimum height of the dialog, the dialog cannot be resized smaller than this.
   *     show_header: true - if true, the dialog header is shown. If false allow_move has no effect.
   * })
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "dialog",
   *    "action": "show",
   *    "args": {
   *        "target": "$context.target",
   *        "position": "left",
   *        "anchor": "top",
   *        "size": "auto",
   *        "margin": 10
   *
   *        "header": "$context.header",
   *        "main": "$context.main",
   *        "footer": "$context.footer",
   *
   *       "title": "My Title",
   *       "auto_close": true,
   *       "allow_resize": true,
   *       "allow_move": true,
   *       "min_width": 100,
   *       "min_height": 100,
   *       "show_header": true
   *    }
   */
  static async show(step, context, process, item) {
    const headerElement = await crs.process.getValue(step.args.header, context, process, item);
    const mainElement = await crs.process.getValue(step.args.main, context, process, item);
    const footerElement = await crs.process.getValue(step.args.footer, context, process, item);
    const target = await crs.process.getValue(step.args.target, context, process, item);
    const position = await crs.process.getValue(step.args.position ?? "left", context, process, item);
    const anchor = await crs.process.getValue(step.args.anchor ?? "top", context, process, item);
    const size = await crs.process.getValue(step.args.size, context, process, item);
    const margin = await crs.process.getValue(step.args.margin ?? 0, context, process, item);
    const close = await crs.process.getValue(step.args.close ?? true, context, process, item);
    const severity = await crs.process.getValue(step.args.severity, context, process, item);
    const title = await crs.process.getValue(step.args.title, context, process, item);
    const allowResize = await crs.process.getValue(step.args.allow_resize, context, process, item) ?? true;
    const allowMove = await crs.process.getValue(step.args.allow_move, context, process, item) ?? true;
    const minWidth = await crs.process.getValue(step.args.min_width, context, process, item);
    const minHeight = await crs.process.getValue(step.args.min_height, context, process, item);
    const showHeader = await crs.process.getValue(step.args.show_header, context, process, item) ?? true;
    const autoClose = await crs.process.getValue(step.args.auto_close, context, process, item) ?? false;
    const callback = await crs.process.getValue(step.args.callback, context, process, item) ?? null;
    const parent = await crs.call("dom", "get_element", { element: step.args.parent }, context, process, item) ?? document.body;
    const modal = await crs.process.getValue(step.args.modal, context, process, item) ?? true;
    const options = {
      target,
      position,
      anchor,
      size,
      margin,
      title,
      severity,
      allowResize,
      allowMove,
      minWidth,
      minHeight,
      showHeader,
      autoClose,
      callback,
      parent
    };
    const dialog = await ensureDialog(close, parent);
    dialog.show(headerElement, mainElement, footerElement, options, context);
    if (modal === false) {
      dialog.classList.add("not-modal");
    }
    return dialog;
  }
  /**
   * Force close the dialog and all of it's content by removing it from the dom
   * @param step  - the process step.
   * @param context - the binding context.
   * @param process - the current process.
   * @param item - the current item in the process if in a loop.
   * @returns {Promise<void>}
   */
  static async force_close(step, context, process, item) {
    if (globalThis.dialog) {
      globalThis.dialog.remove();
      globalThis.dialog = null;
    }
    return false;
  }
}
async function ensureDialog(close, parent) {
  if (close == true) {
    await crs.call("dialog", "force_close", {});
  }
  if (globalThis.dialog == null) {
    globalThis.dialog = document.createElement("dialog-component");
    parent.appendChild(globalThis.dialog);
  }
  return globalThis.dialog;
}
crs.intent.dialog = DialogActions;
export {
  DialogActions
};
