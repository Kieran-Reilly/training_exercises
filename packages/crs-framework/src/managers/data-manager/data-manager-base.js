class BaseDataManager {
  #id;
  #idField;
  #count = 0;
  #selectedCount = 0;
  #selectedIndexes = /* @__PURE__ */ new Set();
  #selectionState = SelectionState.None;
  #events = [];
  /**
   * @property count {number} - The number of records in the data manager
   * @returns {*}
   */
  get count() {
    return this.#count;
  }
  /**
   * @property count {number} - The number of records in the data manager
   * This is for internal use of the data managers only.
   * @param newValue
   */
  set count(newValue) {
    this.#count = newValue;
  }
  /**
   * @property isAllSelected {boolean} - Indicates if all of the records in the data manager are selected
   * @returns {boolean | string}
   */
  get isAllSelected() {
    if (this.#selectionState === SelectionState.All)
      return true;
    if (this.#selectionState === SelectionState.None)
      return false;
    return this.#selectionState;
  }
  /**
   * @property idField {string} - The name of the field that is used to identify records (primary key)
   * @returns {*}
   */
  get idField() {
    return this.#idField;
  }
  /**
   * @property eventCount {number} - The number of events that are currently registered
   * @returns {number}
   */
  get eventCount() {
    return this.#events.length;
  }
  /**
   * @constructor
   * @param id {string} - The id of the data manager
   * @param idField {string} - The name of the field that is used to identify records (primary key)
   */
  constructor(id, idField) {
    this.#id = id;
    this.#idField = idField;
  }
  /**
   * @method dispose - This method is called when the data manager is no longer needed. It should be used to clean up any resources that are being used.
   */
  dispose() {
    this.#id = null;
    this.#idField = null;
    this.#events = null;
    this.#count = null;
    this.#selectedCount = null;
  }
  /**
   * @method setRecords - This method is called to set the records in the data manager.
   * It should be used to initialize the data manager.
   * @param records {Array} - The records to set in the data manager
   */
  async setRecords(records) {
    this.#count = records?.length || 0;
    for (let i = 0; i < records.length; i++) {
      records[i]._index = i;
    }
  }
  /**
   * @method append - This method is called to append records to the data manager.
   * @param record
   */
  async append(count) {
    this.#count += count;
  }
  /**
   * @method removeIndexes - This method is called to remove records from the data manager by index.
   * @param count
   */
  async removeIndexes(count) {
    this.#count -= count;
  }
  /**
   * @method removeIds - This method is called to remove records from the data manager by id (based on the idField as the id).
   * @param count
   */
  async removeIds(count) {
    this.#count -= count;
  }
  /**
   * @method addChangeCallback - This method is called to register a callback that will be called when the data manager changes.
   * @param callback {function} - The callback to register
   */
  async addChangeCallback(callback) {
    const index = this.#events.indexOf(callback);
    if (index == -1) {
      this.#events.push(callback);
    }
  }
  /**
   * @method removeChangeCallback - This method is called to remove a callback that was previously registered.
   * @param callback {function} - The callback to remove
   */
  async removeChangeCallback(callback) {
    const index = this.#events.indexOf(callback);
    if (index != -1) {
      this.#events.splice(index, 1);
    }
  }
  /**
   * @method notifyChanges - This method is called to notify all registered callbacks that the data manager has changed.
   * @param args {object} - The arguments to pass to the callback
   * @returns {Promise<void>}
   */
  async notifyChanges(args) {
    args.managerId = this.#id;
    for (let event of this.#events) {
      await event(args);
    }
  }
  /**
   * @method beginTransaction - start a transaction if the data manager supports it
   * @returns {null}
   */
  async beginTransaction() {
    return null;
  }
  /**
   * @method commit - commit a transaction if the data manager supports it
   * @returns {null}
   */
  async commit() {
    return null;
  }
  /**
   * @method rollback - rollback a transaction if the data manager supports it
   */
  async rollback() {
    return null;
  }
  async setSelectedIndexes(indexes, selected) {
    const fn = selected ? "add" : "delete";
    for (const index of indexes) {
      this.#selectedIndexes[fn](index);
    }
    await this.#calculateState();
  }
  async toggleSelectedIndexes(indexes) {
    if (indexes == null) {
      for (let i = 0; i < this.count; i++) {
        this.#toggleSelectedIndex(i);
      }
    } else {
      for (const index of indexes) {
        this.#toggleSelectedIndex(index);
      }
    }
    await this.#calculateState();
  }
  async #calculateState() {
    if (this.#selectedIndexes.size === 0) {
      this.#selectionState = SelectionState.None;
    } else if (this.#selectedIndexes.size === this.count) {
      this.#selectionState = SelectionState.All;
    } else {
      this.#selectionState = SelectionState.Mixed;
    }
  }
  #toggleSelectedIndex(index) {
    this.#selectedIndexes.has(index) ? this.#selectedIndexes.delete(index) : this.#selectedIndexes.add(index);
  }
  async setSelectedAll(selected) {
    this.#selectedIndexes.clear();
    this.#selectionState = selected ? SelectionState.All : SelectionState.None;
  }
  isSelected(index) {
    if (this.#selectionState === SelectionState.All)
      return true;
    if (this.#selectionState === SelectionState.None)
      return false;
    return this.#selectedIndexes.has(index);
  }
  async getSelectedIndexes() {
    if (this.#selectionState === SelectionState.All) {
      return Array.from({ length: this.count }, (_, i) => i);
    } else {
      return Array.from(this.#selectedIndexes.values());
    }
  }
  /**
   * This function will mark the records with the selection state. It takes a startIndex and endIndex to determine which index to use to determine selection
   * @param records - The records to mark
   * @param startIndex - The start index to use to determine selection
   * @param endIndex - The end index to use to determine selection
   * @returns {Promise<*>}
   */
  async markRecordsWithSelection(records, startIndex = 0, endIndex = records.length) {
    if (this.#selectionState === SelectionState.All) {
      for (let i = 0; i < records.length; i++) {
        records[i]._selected = true;
      }
    } else if (this.#selectionState === SelectionState.None) {
      for (let i = 0; i < records.length; i++) {
        records[i]._selected = false;
      }
    } else {
      for (let i = startIndex; i < endIndex; i++) {
        records[i]._selected = this.#selectedIndexes.has(i);
      }
    }
    return records;
  }
}
const SelectionState = Object.freeze({
  None: "none",
  Mixed: "mixed",
  All: "all"
});
export {
  BaseDataManager
};
