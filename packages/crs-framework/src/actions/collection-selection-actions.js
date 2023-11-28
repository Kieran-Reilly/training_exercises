import { CollectionSelectionManager } from "../managers/collection-selection-manager/collection-selection-manager.js";
class CollectionSelectionActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  static async enable(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    const selectionQuery = await crs.process.getValue(step.args.selection_query, context, process, item);
    const masterQuery = await crs.process.getValue(step.args.master_query, context, process, item);
    const groupQuery = await crs.process.getValue(step.args.group_query, context, process, item);
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    const virtualizedElement = await crs.process.getValue(step.args.virtualized_element, context, process, item);
    element.__collectionSelectionManager = new CollectionSelectionManager(element, masterQuery, selectionQuery, groupQuery, manager, virtualizedElement);
  }
  static async disable(step, context, process, item) {
    const element = await crs.dom.get_element(step, context, process, item);
    if (element.__collectionSelectionManager) {
      element.__collectionSelectionManager = element.__collectionSelectionManager.dispose();
    }
  }
}
crs.intent.collection_selection = CollectionSelectionActions;
export {
  CollectionSelectionActions
};
