class KanBanActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  /**
   * Watch for changes on the data manager
   */
  static async observe_changes(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    await element.observe_changes();
  }
  /**
   * Don't watch for changes on the observation manager
   */
  static async unobserve_changes(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    await element.unobserve_changes();
  }
  /**
   * Redraw the kanban from scratch with what data there is
   */
  static async refresh(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    await element.refresh();
  }
}
crs.intent.kan_ban = KanBanActions;
export {
  KanBanActions
};
