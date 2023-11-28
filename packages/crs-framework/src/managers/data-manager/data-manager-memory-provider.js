import { BaseDataManager } from "./data-manager-base.js";
class DataManagerMemoryProvider extends BaseDataManager {
  #records;
  set records(newValue) {
    this.setRecords(newValue);
  }
  /**
   * @method setRecords - This method is called to set the records in the data manager.
   * @param records
   */
  async setRecords(records) {
    this.#records = records;
    await super.setRecords(records);
  }
  /**
   * @method append - This method is called to append records to the data manager.
   * @param record
   */
  async append(...record) {
    this.#records.push(...record);
    super.append(this.#records.length);
  }
  /**
   * @method getAll - This method is called to get all of the records in the data manager.
   * @returns {*}
   */
  async getAll() {
    return super.markRecordsWithSelection(this.#records);
  }
  /**
   * @method getPage - This method is called to get a page of records from the data manager.
   * @param from {number} - The index of the first record to get
   * @param to {number} - The index of the last record to get
   * @returns {*}
   */
  async getPage(from, to) {
    return super.markRecordsWithSelection(this.#records.slice(from, to), from, to);
  }
  /**
   * @method getByIndex - This method is called to get a record by its index.
   * @param index {number} - The index of the record to get
   * @returns {*}
   */
  async getByIndex(indexes) {
    indexes = Array.isArray(indexes) ? indexes : [indexes];
    const result = [];
    for (const index of indexes) {
      const record = this.#records[index];
      record._selected = super.isSelected(index);
      result.push(record);
    }
    return result;
  }
  /**
   * @method getById - This method is called to get a record by its id.
   * @param id {number} - The id of the record to get
   * @returns {*}
   */
  async getById(id) {
    return this.#records.find((item) => item[this.idField] == id);
  }
  /**
   * @method getIds - This method is called to get the ids of records by their indexes.
   * @param indexes {number[]} - The indexes of the records to get
   * @returns {*[]}
   */
  async getIds(indexes) {
    const ids = [];
    for (const index of indexes) {
      ids.push(this.#records[index][this.idField]);
    }
    return ids;
  }
  /**
   * @method removeIndexes - This method is called to remove records by their indexes.
   * @param indexes {number[]} - The indexes of the records to remove
   * @returns {{indexes, ids: *[]}}
   */
  async removeIndexes(indexes) {
    indexes.sort((a, b) => a > b ? -1 : 1);
    const ids = [];
    for (const index of indexes) {
      ids.push(this.#records[index][this.idField]);
      this.#records.splice(index, 1);
    }
    super.removeIndexes(this.#records.length);
    return { indexes, ids };
  }
  /**
   * @method removeIds - This method is called to remove records by their ids.
   * @param ids {number[]} - The ids of the records to remove
   * @returns {{indexes: *[], ids}}
   */
  async removeIds(ids) {
    const indexes = [];
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] == id);
      indexes.push(index);
      this.#records.splice(index, 1);
    }
    indexes.sort((a, b) => a > b ? -1 : 1);
    super.removeIds(this.#records.length);
    return { indexes, ids };
  }
  /**
   * @method updateIndex - This method is called to update a record by its index.
   * @param index {number} - The index of the record to update
   * @param changes {object} - The changes to make to the record
   * @returns {{changes, index, id: *}}
   */
  async updateIndex(index, changes) {
    const record = this.#records[index];
    const id = record[this.idField];
    const keys = Object.keys(changes);
    for (const key of keys) {
      record[key] = changes[key];
    }
    return { id, index, changes };
  }
  /**
   * @method updateId - This method is called to update a record by its id.
   * @param id {number} - The id of the record to update
   * @param changes {object} - The changes to make to the record
   * @returns {{changes, index: *, id}}
   */
  async updateId(id, changes) {
    const index = this.#records.findIndex((item) => item[this.idField] == id);
    const record = this.#records[index];
    const keys = Object.keys(changes);
    for (const key of keys) {
      record[key] = changes[key];
    }
    return { id, index, changes };
  }
  async setSelectedIndexes(indexes, selected) {
    await super.setSelectedIndexes(indexes, selected);
  }
  async update(record) {
    const id = record[this.idField];
    this.updateId(id, record);
  }
  async setSelectedIds(ids, selected) {
    const indexes = [];
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] == id);
      indexes.push(index);
    }
    await this.setSelectedIndexes(indexes, selected);
  }
  async toggleSelectedIds(ids) {
    const indexes = [];
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] === id);
      if (index != -1) {
        indexes.push(index);
      }
    }
    await super.toggleSelectedIndexes(indexes);
  }
  async getSelected(isSelected = true) {
    const result = this.#records.filter((item, index) => this.isSelected(index) === isSelected);
    return super.markRecordsWithSelection(result);
  }
}
export {
  DataManagerMemoryProvider
};
