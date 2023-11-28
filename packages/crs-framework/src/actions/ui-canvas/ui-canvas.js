import { ColumnsActions } from "../columns-actions.js";
class UICanvas {
  #element;
  constructor(element) {
    this.#element = element;
  }
  dispose() {
    this.#element.__uiCanvas = null;
    this.#element = null;
  }
}
class UICanvasActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  static async enable(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    element.__uiCanvas = new UICanvas(element);
  }
  static async disable(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    element.__uiCanvas.dispose();
  }
}
crs.intent.ui_canvas = UICanvasActions;
export {
  UICanvasActions
};
