import { CHANGE_TYPES, MANAGER_TYPES } from "./data-manager-types.js";
class DataManagerActions {
  /**
   * @method perform - Perform an action on a data manager. Main interface for working with data managers via the process-api
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   * @returns {Promise<void>}
   */
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  /**
   * @method register - Register a data manager that can be accessed by other UI or process components
   * @param step  {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.id_field {string} - The name of the field that contains the id of the record. Default is "id"
   * @param step.args.type {string} - The type of data manager to use. Default is "indexdb" but you can also use "memory" or "perspective"
   * @param step.args.perspective {string} - The name of the perspective to use. Only used if type is "perspective"
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "register" {
   *     manager: "my_data_manager",
   *     id_field: "id",
   *     type: "memory",
   *     records: []
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "register",
   *     "args": {
   *         "manager": "my_data_manager",
   *         "id_field": "id",
   *         "type": "memory",
   *         "records": "$context.data.records
   *     }
   * }
   *
   * @returns {Promise<*>}
   */
  static async register(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    const dataField = await crs.process.getValue(step.args.id_field || "id", context, process, item);
    const type = await crs.process.getValue(step.args.type || "idb", context, process, item);
    const records = await crs.process.getValue(step.args.records || [], context, process, item);
    const selectedIndexes = await crs.process.getValue(step.args.selected_indexes || [], context, process, item);
    if (type === "idb" && globalThis.hasDataManagerDB != true) {
      await import("./../../../packages/crs-process-api/action-systems/managers/indexdb-manager.js");
      await crs.call("idb", "connect", {
        "name": "data-manager",
        "version": 1,
        "count": 50,
        "storeNames": []
      });
      globalThis.hasDataManagerDB = true;
    }
    globalThis.dataManagers ||= {};
    if (globalThis.dataManagers[manager] == null) {
      globalThis.dataManagers[manager] = new MANAGER_TYPES[type](manager, dataField);
    }
    const instance = globalThis.dataManagers[manager];
    if (type === "perspective") {
      instance.perspective = await crs.process.getValue(step.args["perspective"], context, process, item);
      instance.manager = await crs.process.getValue(step.args["source_manager"], context, process, item);
    }
    if (type !== "perspective") {
      await instance.setRecords(records);
      await instance.setSelectedIndexes(selectedIndexes, true);
    }
    return globalThis.dataManagers[manager];
  }
  /**
   * @method dispose - Dispose a data manager that can be accessed by other UI or process components and remove it from the global data manager list
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "dispose" {
   *     manager: "my_data_manager",
   * })
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "data_manager",
   *    "action": "dispose",
   *        "args": {
   *        "manager": "my_data_manager"
   *    }
   * }
   */
  static async dispose(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    globalThis.dataManagers[manager].dispose();
    delete globalThis.dataManagers[manager];
  }
  /**
   * @method record_count - Get the count of records in a data manager
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * const count = await crs.call("data_manager", "record_count" {
   *    manager: "my_data_manager"
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "record_count",
   *     "args": {
   *         "manager": "my_data_manager"
   *     }
   * }
   */
  static async record_count(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return 0;
    const dataManager = globalThis.dataManagers[manager];
    return dataManager.count;
  }
  /**
   * @method selected_count - Get the count of selected records in a data manager
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   * @returns {Promise<number|*|number>}
   */
  static async selected_count(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return 0;
    const dataManager = globalThis.dataManagers[manager];
    return dataManager.selectedCount;
  }
  static async get_counts(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return 0;
    const dataManager = globalThis.dataManagers[manager];
    return { total: dataManager.count, selected: dataManager.selectedCount };
  }
  /**
   * @method set_records - Set records for a data manager
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.records {array} - The records to use
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "set_records" {
   *    manager: "my_data_manager",
   *    records: [
   *        { id: 1, name: "John" },
   *        { id: 2, name: "Jane" }
   *    ]
   * })
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "data_manager",
   *    "action": "set_records",
   *    "args": {
   *        "manager": "my_data_manager",
   *        "records": [
   *            { id: 1, name: "John" },
   *            { id: 2, name: "Jane" }
   *        ]
   *    }
   * }
   */
  static async set_records(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const records = await crs.process.getValue(step.args.records || [], context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    await dataManager.setRecords(records);
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.refresh,
      count: dataManager.count
    });
  }
  /**
   * @method append - Append records to a data manager
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.records {array} - The records to append
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "append" {
   *     manager: "my_data_manager",
   *     records: [{ id: 1, name: "test" }]
   * })
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "data_manager",
   *    "action": "append",
   *    "args": {
   *        "manager": "my_data_manager",
   *        "records": [{ id: 1, name: "test" }]
   *    }
   * }
   */
  static async append(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const records = await crs.process.getValue(step.args.records || [], context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    const index = dataManager.count;
    await dataManager.append(...records);
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.add,
      models: records,
      index,
      count: records.length
    });
  }
  /**
   * @method remove - Remove records from a data manager
   * You can either send a list of indexes or a list of ids to remove.
   * Using indexes is faster than using ids.
   *
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param [step.args.indexes] {array} - The indexes of the records to remove
   * @param [step.args.ids] {array} - The ids of the records to remove
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example using indexes</caption>
   * await crs.call("data_manager", "remove" {
   *    manager: "my_data_manager",
   *    indexes: [0, 1, 2]
   * });
   *
   * @example <caption>javascript example using ids</caption>
   * await crs.call("data_manager", "remove" {
   *   manager: "my_data_manager",
   *   ids: [1001, 1002, 1003]
   * });
   */
  static async remove(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const indexes = await crs.process.getValue(step.args.indexes, context, process, item);
    const ids = await crs.process.getValue(step.args.ids, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    if (indexes != null) {
      await dataManager.removeIndexes(indexes);
    } else {
      await dataManager.removeIds(ids);
    }
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.delete,
      indexes,
      ids
    });
  }
  /**
   * @method update - Update a single record in a data manager
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param [step.args.index] {number} - The index of the record to update
   * @param [step.args.id] {number} - The id of the record to update
   * @param step.args.changes {object} - The changes to make to the record
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example using index</caption>
   * await crs.call("data_manager", "update" {
   *     manager: "my_data_manager",
   *     index: 0,
   *     changes: {name: "test"}
   * });
   *
   * @example <caption>json example using id</caption>
   * {
   *     "type": "data_manager",
   *     "action": "update",
   *     "args": {
   *         "manager": "my_data_manager",
   *         "index": 0,
   *         "changes": {name: "test"}
   *     }
   * }
   *
   * @example <caption>javascript example using id</caption>
   * await crs.call("data_manager", "update" {
   *    manager: "my_data_manager",
   *    id: 1001,
   *    changes: {name: "test"}
   * });
   *
   * @example <caption>json example using id</caption>
   * {
   *    "type": "data_manager",
   *    "action": "update",
   *    "args": {
   *        "manager": "my_data_manager",
   *        "id": 1001,
   *        "changes": {name: "test"}
   *    }
   * }
   */
  static async update(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const id = await crs.process.getValue(step.args.id, context, process, item);
    const changes = await crs.process.getValue(step.args.changes, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    if (index != null) {
      await dataManager.updateIndex(index, changes);
      await dataManager.notifyChanges({ action: CHANGE_TYPES.update, index, changes });
    } else if (id != null) {
      await dataManager.updateId(id, changes);
      await dataManager.notifyChanges({ action: CHANGE_TYPES.update, id, changes });
    } else {
      const models = await crs.process.getValue(step.args.models, context, process, item);
      await dataManager.update(models);
      await dataManager.notifyChanges({ action: CHANGE_TYPES.update, models });
    }
  }
  /**
   * @method set_group_selected - given a group id, check the records in that group (in the perspective definition) and then select them.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.group_id {string} - The id of the group to select
   * @param step.args.select {boolean} - Whether to select or deselect the group
   * @returns {Promise<void>}
   */
  static async set_group_selected(step, context, process, item) {
  }
  /**
   * @method set_selected - mark a given record as selected by setting the _selected property to true or falce.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param [step.args.index] {number[]} - Collection of indexes of the records to select
   * @param [step.args.id] {number[]} - Collection of ids of the records to select
   * @param step.args.selected {boolean} - The value to set the _selected property to
   *
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example using index</caption>
   * await crs.call("data_manager", "set_selected" {
   *    manager: "my_data_manager",
   *    index: [0],
   *    selected: true
   * });
   *
   * @example <caption>json example using index</caption>
   * {
   *   "type": "data_manager",
   *   "action": "set_selected",
   *   "args": {
   *      "manager": "my_data_manager",
   *      "index": [0],
   *      "selected": true
   *   }
   * }
   */
  static async set_selected(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const selected = await crs.process.getValue(step.args.selected ?? true, context, process, item);
    const indexes = await crs.process.getValue(step.args.indexes, context, process, item);
    const ids = await crs.process.getValue(step.args.ids, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    if (indexes != null) {
      await dataManager.setSelectedIndexes(indexes, selected);
    } else {
      await dataManager.setSelectedIds(ids, selected);
    }
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.selected,
      id: ids,
      index: indexes,
      changes: selected
    });
  }
  /**
   * @method toggle_selection - Toggle the selection of a given record to the opioste of its current state.
   * If no selection has been set yet, it will be set to true.
   * @param step  {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param [step.args.index] {number[]} - Collection of indexes of the records to select
   * @param [step.args.id] {number[]} - Collection of ids of the records to select
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example using index</caption>
   * await crs.call("data_manager", "toggle_selection" {
   *   manager: "my_data_manager",
   *   index: 0
   * });
   *
   * @example <caption>json example using index</caption>
   * {
   *  "type": "data_manager",
   *  "action": "toggle_selection",
   *  "args": {
   *      "manager": "my_data_manager",
   *      "index": [0]
   *   }
   * }
   */
  static async toggle_selection(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const indexes = await crs.process.getValue(step.args.indexes, context, process, item);
    const ids = await crs.process.getValue(step.args.ids, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    if (indexes != null) {
      await dataManager.toggleSelectedIndexes(indexes);
    } else if (ids != null) {
      await dataManager.toggleSelectedIds(ids);
    } else {
      await dataManager.toggleSelectedIndexes();
    }
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.selected,
      id: ids,
      index: indexes,
      changes: "toggle"
    });
  }
  /**
   * @method set_select_all - Select all records in a data manager nor none depending on the value of the selected argument.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.selected {boolean} - The value to set the _selected property to
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "select_all" {
   *   manager: "my_data_manager",
   *   selected: true
   * });
   *
   * @example <caption>json example</caption>
   * {
   *  "type": "data_manager",
   *  "action": "select_all",
   *  "args": {
   *    "manager": "my_data_manager",
   *    "selected": true
   *   }
   * }
   */
  static async set_select_all(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const selected = await crs.process.getValue(step.args.selected ?? true, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    await dataManager.setSelectedAll(selected);
    await dataManager.notifyChanges({
      action: CHANGE_TYPES.selected,
      changes: selected ? "all" : "none"
    });
  }
  /**
   * @method filter_selected - show only selected records in a data manager or those not selected.
   * the selected property is used to determine if you want to show the selected or the non selected values.
   * set selected to true to only show those that are selected and false to show those that are not selected.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "filter_selected" {
   *    manager: "my_data_manager",
   *    selected: true
   * });
   *
   * @example <caption>json example</caption>
   * {
   *   "type": "data_manager",
   *   "action": "filter_selected",
   *   "args": {
   *      "manager": "my_data_manager",
   *      "selected": true
   *   }
   * }
   */
  static async filter_selected(step, context, process, item) {
  }
  /**
   * @method get_selected - Get the selected records in a data manager.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * const selected = await crs.call("data_manager", "get_selected" {
   *   manager: "my_data_manager"
   * });
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "data_manager",
   *    "action": "get_selected",
   *    "args": {
   *        "manager": "my_data_manager"
   *     }
   * }
   */
  static async get_selected(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const dataManager = globalThis.dataManagers[manager];
    return await dataManager.getSelected();
  }
  static async get_unselected(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const dataManager = globalThis.dataManagers[manager];
    return await dataManager.getSelected(false);
  }
  /**
   * @method update_batch - Update records in a data manager.
   * In the array of changes each item can either have a "index" or "id" property that indicates what to update.
   * If the item has a index property, it will update the record at that index.
   * If the item has a id property, it will update the record with that id.
   * The changes object is a key value pair where the property is the property to update and the value is the value change.
   *
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.batch {array} - The batch of records to update
   * @returns {Promise<void>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "update_batch" {
   *    manager: "my_data_manager",
   *    batch: [
   *        { index: 0, changes: {name: "test"} },
   *        { id: 1001, changes: {name: "test"} }
   *    ]
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "update_batch",
   *     "args": {
   *          "manager": "my_data_manager",
   *          "batch": [
   *              { "index": 0, "changes": { "name": "test" } },
   *              { "id": 1001, "changes": { "name": "test" } }
   *          ]
   *     }
   * }
   */
  static async update_batch(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const batch = await crs.process.getValue(step.args.batch, context, process, item);
    const dataManager = globalThis.dataManagers[manager];
    await dataManager.beginTransaction();
    for (let item2 of batch) {
      let result;
      if (item2.index != null) {
        result = await dataManager.updateIndex(item2.index, item2.changes);
      } else {
        result = await dataManager.updateId(item2.id, item2.changes);
      }
      const model = await dataManager.getByIndex(result.index);
      await dataManager.notifyChanges({
        action: CHANGE_TYPES.update,
        index: result.index,
        id: result.id,
        model: model[0]
      });
    }
    await dataManager.commit();
  }
  /**
   * @method get - Get a record from a data manager.
   * This can be index based or id based.
   *
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param [step.args.index] {number} - The index of the record to get
   * @param [step.args.id] {number} - The id of the record to get
   * @returns {Promise<[]|null>}
   *
   * @example <caption>javascript example using index</caption>
   * const record = await crs.call("data_manager", "get" {
   *     manager: "my_data_manager",
   *     index: 0
   * });
   *
   * @example <caption>javascript example using id</caption>
   * const record = await crs.call("data_manager", "get" {
   *     manager: "my_data_manager",
   *     id: 1001
   * });
   *
   * @example <caption>json example using index</caption>
   * {
   *    "type": "data_manager",
   *    "action": "get",
   *    "args": {
   *        "manager": "my_data_manager",
   *        "index": 0
   *    }
   * }
   *
   * @example <caption>json example using id</caption>
   * {
   *   "type": "data_manager",
   *   "action": "get",
   *   "args": {
   *      "manager": "my_data_manager",
   *      "id": 1001
   *    }
   * }
   */
  static async get(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const index = await crs.process.getValue(step.args.index, context, process, item);
    const id = await crs.process.getValue(step.args.id, context, process, item);
    if (globalThis.dataManagers[manager] == null) {
      return null;
    }
    if (index != null) {
      if (index < 0 || index > globalThis.dataManagers[manager].count - 1)
        return null;
      return globalThis.dataManagers[manager].getByIndex(index);
    }
    return globalThis.dataManagers[manager].getById(id);
  }
  /**
   * @method get_batch - Get a page of records from a data manager.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.from {number} - The index of the first record to get
   * @param step.args.to {number} - The index of the last record to get
   *
   * @returns {Promise<*|null>}
   */
  static async get_batch(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const from = await crs.process.getValue(step.args.from, context, process, item);
    const to = await crs.process.getValue(step.args.to, context, process, item);
    if (globalThis.dataManagers[manager] == null) {
      return null;
    }
    return globalThis.dataManagers[manager].getPage(from, to);
  }
  /**
   * @method get_page - Get a page of records from a data manager.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.page {number} - The page number to get - page numbers start at 1
   * @param step.args.size {number} - The number of records per page
   * @returns {Promise<*|null>}
   *
   * @example <caption>javascript example</caption>
   * const records = await crs.call("data_manager", "get_page" {
   *    manager: "my_data_manager",
   *    page: 1,
   *    size: 10
   * });
   *
   * @example <caption>json example</caption>
   * {
   *   "type": "data_manager",
   *   "action": "get_page",
   *   "args": {
   *       "manager": "my_data_manager",
   *       "page": 1,
   *       "size": 10
   *   }
   * }
   */
  static async get_page(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const page = await crs.process.getValue(step.args.page, context, process, item);
    const size = await crs.process.getValue(step.args.size, context, process, item);
    if (globalThis.dataManagers[manager] == null) {
      return null;
    }
    const from = page * size - size;
    const to = from + size;
    return await globalThis.dataManagers[manager].getPage(from, to);
  }
  /**
   * @method get_all - Get all records from a data manager.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @returns {Promise<*|null>}
   *
   * @example <caption>javascript example</caption>
   * const records = await crs.call("data_manager", "get_all" {
   *   manager: "my_data_manager"
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "get_all",
   *     "args": {
   *         "manager": "my_data_manager"
   *     }
   * }
   */
  static async get_all(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    if (globalThis.dataManagers[manager] == null) {
      return null;
    }
    return globalThis.dataManagers[manager].getAll();
  }
  /**
   * @method get_ids - given an array of indexes, get the id value for each record and return and array of ids
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.indexes {array} - An array of indexes to get the id for
   * @returns {Promise<*[]|*|null>}
   *
   * @example <caption>javascript example</caption>
   * const ids = await crs.call("data_manager", "get_ids" {
   *    manager: "my_data_manager",
   *    indexes: [1, 2, 3]
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "get_ids",
   *     "args": {
   *         "manager": "my_data_manager",
   *         "indexes": [1, 2, 3]
   *     }
   * }
   */
  static async get_ids(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const indexes = await crs.process.getValue(step.args.indexes, context, process, item);
    if (globalThis.dataManagers[manager] == null) {
      return null;
    }
    return globalThis.dataManagers[manager].getIds(indexes);
  }
  /**
   * @method on_change - Add a callback to be called when a record is added, updated or deleted.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.callback {function} - The callback to be called when a record is added, updated or deleted.
   * @returns {Promise<void|*>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "on_change" {
   *     manager: "my_data_manager",
   *     callback: (args) => {
   *         ...
   *     }
   * });
   *
   * @example <caption>json example</caption>
   * {
   *    "type": "data_manager",
   *    "action": "on_change",
   *    "args": {
   *        "manager": "my_data_manager",
   *        "callback": "$context.my_callback"
   *    }
   * }
   */
  static async on_change(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    const callback = await crs.process.getValue(step.args.callback, context, process, item);
    return globalThis.dataManagers[manager].addChangeCallback(callback);
  }
  /**
   * @method remove_change - Remove a callback from the list of callbacks to be called when a record is added, updated or deleted.
   * @param step {object} - The step that contains the action to perform
   * @param context {object} - The context of the process
   * @param process {object} - The process
   * @param item {object} - Current item in a process loop
   *
   * @param step.args.manager {string} - The name of the data manager. You will use this when performing operations on the data manager.
   * @param step.args.callback {function} - The callback to be removed.
   * @returns {Promise<void|*>}
   *
   * @example <caption>javascript example</caption>
   * await crs.call("data_manager", "remove_change" {
   *    manager: "my_data_manager",
   *    callback: callbackHandler,
   * });
   *
   * @example <caption>json example</caption>
   * {
   *     "type": "data_manager",
   *     "action": "remove_change",
   *     "args": {
   *         "manager": "my_data_manager",
   *         "callback": "$context.my_callback"
   *     }
   * }
   */
  static async remove_change(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null || globalThis.dataManagers[manager] == null)
      return;
    const callback = await crs.process.getValue(step.args.callback, context, process, item);
    return globalThis.dataManagers[manager].removeChangeCallback(callback);
  }
  static async is_all_selected(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    if (manager == null)
      return;
    return globalThis.dataManagers[manager].isAllSelected;
  }
}
crs.intent.data_manager = DataManagerActions;
