class EditingActions {
  static #cellRole = "gridcell";
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  static async edit(step, context, process, item) {
    const cell = await crs.dom.get_element(step, context, process, item);
    if (cell?.getAttribute("role") != this.#cellRole)
      return;
    console.log(cell);
  }
}
crs.intent.grid_editing = EditingActions;
export {
  EditingActions
};
