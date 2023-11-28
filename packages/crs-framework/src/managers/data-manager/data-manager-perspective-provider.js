import { BaseDataManager } from "./data-manager-base.js";
import { CHANGE_TYPES } from "./data-manager-types.js";
class DataManagerPerspectiveProvider extends BaseDataManager {
  /**
   * @field records - The records that are currently in the perspective
   * When working with sorting and filtering this is just an array of indexes.
   * When working with grouping however this needs to represent the group as it stands now, expanded or collapsed.
   * If expanded then the array will also contain the ids but if collapsed then it will only contain the group item.
   */
  #records;
  /**
   * @field grouping - This is the grouping perspective that we use to populate the records with.
   * When you expand a grouping this is queried to know what to add or remove from the records.
   */
  #grouping;
  #manager;
  #perspective;
  get perspective() {
    return this.#perspective;
  }
  set perspective(newValue) {
    this.#perspective = newValue;
  }
  get manager() {
    return this.#manager;
  }
  set manager(newValue) {
    this.#manager = newValue;
  }
  get records() {
    return this.#records;
  }
  set records(newValue) {
    this.#records = newValue;
  }
  get grouping() {
    return this.#grouping;
  }
  set grouping(newValue) {
    this.#grouping = newValue;
  }
  async notifyChanges(args) {
    return globalThis.dataManagers[this.#manager].notifyChanges(args);
  }
  setRecords(records) {
    return globalThis.dataManagers[this.#manager].setRecords(records);
  }
  append(...record) {
    return globalThis.dataManagers[this.#manager].append(...record);
  }
  /**
   * @method getAll - Get all records from the data manager
   * In this case we need to look at what records are in the perspective and then get those records from the source
   * If there is a grouping defined, get all will return the expanded group records including the group item it self.
   */
  async getAll() {
    const manager = globalThis.dataManagers[this.#manager];
    return manager.getByIndex(this.#records);
  }
  /**
   * @method getPage - Get the page from the perspective and return the records from the source
   * If there is a grouping defined, get page will return the expanded group records including the group item it self.
   * @param from {number} - the start index
   * @param to {number} - the end index
   */
  async getPage(from, to) {
    if (this.#records == null || this.#records.length === 0) {
      return [];
    }
    const manager = globalThis.dataManagers[this.#manager];
    const records = this.#records.slice(from, to);
    return manager.getByIndex(records);
  }
  getByIndex(index) {
    return globalThis.dataManagers[this.#manager].getByIndex(index);
  }
  getById(id) {
    return globalThis.dataManagers[this.#manager].getById(id);
  }
  getIds(indexes) {
    return globalThis.dataManagers[this.#manager].getIds(indexes);
  }
  removeIndexes(indexes) {
    return globalThis.dataManagers[this.#manager].removeIndexes(indexes);
  }
  removeIds(ids) {
    return globalThis.dataManagers[this.#manager].removeIds(ids);
  }
  updateIndex(index, changes) {
    return globalThis.dataManagers[this.#manager].updateIndex(index, changes);
  }
  updateId(id, changes) {
    return globalThis.dataManagers[this.#manager].updateId(id, changes);
  }
  setSelectedIndexes(indexes, selected) {
    return globalThis.dataManagers[this.#manager].setSelectedIndexes(indexes, selected);
  }
  setSelectedIds(ids, selected) {
    return globalThis.dataManagers[this.#manager].setSelectedIds(ids, selected);
  }
  getSelected(isSelected = true) {
    return globalThis.dataManagers[this.#manager].getSelected(isSelected);
  }
  toggleSelectedIndexes(indexes) {
    return globalThis.dataManagers[this.#manager].toggleSelectedIndexes(indexes);
  }
  toggleSelectedIds(ids) {
    return globalThis.dataManagers[this.#manager].toggleSelectedIds(ids);
  }
  setSelectedAll(selected) {
    return globalThis.dataManagers[this.#manager].setSelectedAll(selected);
  }
  async perspectiveChanged() {
    const definition = await crs.call("perspective", "get", { perspective: this.#perspective });
    if (Object.keys(definition).length === 1) {
      return await this.notifyChanges({
        action: CHANGE_TYPES.perspectiveRollback
      });
    }
    const data = await crs.call("data_manager", "get_all", { manager: this.#manager });
    if (definition.filter.length === 1) {
      definition.filter = definition.filter[0];
    } else {
      const filters = definition.filter;
      definition.filter = {
        "operator": "and",
        "expressions": filters
      };
    }
    const result = await crs.call("data_processing", "get_perspective", {
      source: data,
      intent: definition
    });
    if (Array.isArray(result)) {
      this.#records = result;
      this.count = result.length;
      this.selectedCount = 0;
    }
    await this.notifyChanges({
      action: CHANGE_TYPES.perspectiveChanged,
      count: result.length
    });
  }
}
export {
  DataManagerPerspectiveProvider
};
