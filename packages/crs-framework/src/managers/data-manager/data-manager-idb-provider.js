import { BaseDataManager } from "./data-manager-base.js";
const DB_NAME = "data-manager";
class DataManagerIDBProvider extends BaseDataManager {
  #storeName;
  #sessionKey;
  get storeName() {
    return this.#storeName;
  }
  set records(newValue) {
    this.setRecords(newValue).catch((errors) => console.error(errors));
  }
  dispose() {
    crs.call("idb", "release_stores", {
      "name": DB_NAME,
      "stores": [this.#storeName]
    }).catch((error) => console.error(error));
    super.dispose();
  }
  async setRecords(records) {
    await super.setRecords(records);
    const result = await crs.call("idb", "set", {
      "name": DB_NAME,
      "store": this.#storeName,
      "records": records,
      "clear": true
    });
    this.#storeName = result.data;
    this.#sessionKey = `${DB_NAME}_${this.#storeName}`;
  }
  async append(...record) {
    await crs.call("idb", "set", {
      "name": DB_NAME,
      "store": this.#storeName,
      "records": record,
      "clear": false
    });
  }
  async getAll() {
    const idbResponse = await crs.call("idb", "get_all", {
      "name": DB_NAME,
      "store": this.#storeName
    });
    return super.markRecordsWithSelection(idbResponse.data);
  }
  async getPage(from, to) {
    const idbResponse = await crs.call("idb", "get_batch", {
      "name": DB_NAME,
      "store": this.#storeName,
      "startIndex": from,
      "endIndex": to
    });
    return super.markRecordsWithSelection(idbResponse.data, from, to);
  }
  async getByIndex(indexes) {
    const idbResponse = await crs.call("idb", "get", {
      "name": DB_NAME,
      "store": this.#storeName,
      "indexes": Array.isArray(indexes) ? indexes : [indexes]
    });
    for (const record of idbResponse.data) {
      record._selected = this.isSelected(record._index);
    }
    return idbResponse.data;
  }
  async getById(id) {
    return await crs.call("idb", "get_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "id": id
    });
  }
  async getIds(indexes) {
    const records = await crs.call("idb", "get", {
      "name": DB_NAME,
      "store": this.#storeName,
      "indexes": indexes
    });
    const ids = [];
    for (const record of records) {
      ids.push(record[this.idField]);
    }
    return ids;
  }
  async removeIndexes(indexes) {
    await crs.call("idb", "delete_by_index", {
      "name": DB_NAME,
      "store": this.#storeName,
      "index": indexes
    });
  }
  async removeIds(ids) {
    await crs.call("idb", "delete_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "ids": ids
    });
  }
  async updateIndex(index, changes) {
    await crs.call("idb", "change_by_index", {
      "name": DB_NAME,
      "store": this.#storeName,
      index,
      changes
    });
  }
  async updateId(id, changes) {
    await crs.call("idb", "change_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      id,
      changes
    });
  }
  async update(record) {
    await crs.call("idb", "update_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "models": record
    });
  }
  async setSelectedIds(ids, selected) {
    const indexes = await crs.call("idb", "get_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "ids": ids
    });
    return await this.setSelectedIndexes(indexes, selected);
  }
  async toggleSelectedIds(ids) {
    const indexes = await crs.call("idb", "get_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "ids": ids
    });
    return await super.toggleSelectedIndexes(indexes);
  }
  async getSelected(isSelected = true) {
    let indexes;
    if (isSelected === true) {
      indexes = await super.getSelectedIndexes();
    } else {
      indexes = [];
      for (let i = 0; i < this.count; i++) {
        if (this.isSelected(i) === false) {
          indexes.push(i);
        }
      }
    }
    const idbResponse = await crs.call("idb", "get", {
      "name": DB_NAME,
      "store": this.#storeName,
      "indexes": indexes
    });
    return super.markRecordsWithSelection(idbResponse.data);
  }
}
export {
  DataManagerIDBProvider
};
