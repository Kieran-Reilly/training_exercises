import { loadHTML } from "./../../src/load-resources.js";
import { CHANGE_TYPES } from "../../src/managers/data-manager/data-manager-types.js";
import { ColumnsManager } from "./managers/columns-manager.js";
import { columnsFromChildren } from "./utils/columnsFromChildren.js";
import { columnsHeadersFactory } from "./factories/columns-headers-factory.js";
import { rowInflationFactory } from "./factories/row-inflation-factory.js";
import { rowFactory } from "./factories/row-factory.js";
import { MouseInputManager } from "./managers/mouse-input-manager.js";
import { KeyboardInputManager } from "./managers/keyboard-input-manager.js";
import { DataTableExtensions } from "./data-table-extensions.js";
import { formattingFromChildren } from "./utils/formattingFromChildren.js";
import "./../../src/managers/perspective-manager/perspective-manager-actions.js";
class DataTable extends HTMLElement {
  #columnsManager = new ColumnsManager();
  #oldDataManager;
  #dataManager;
  #perspective;
  #perspectiveDataManagerKey;
  #dataManagerChangedHandler = this.#dataManagerChanged.bind(this);
  #inflationFn;
  #keyboardInputManager;
  #mouseInputManager;
  #extensions = {
    [DataTableExtensions.FORMATTING.name]: DataTableExtensions.FORMATTING.path,
    [DataTableExtensions.CELL_EDITING.name]: DataTableExtensions.CELL_EDITING.path,
    [DataTableExtensions.RESIZE.name]: DataTableExtensions.RESIZE.path,
    [DataTableExtensions.FILTER.name]: DataTableExtensions.FILTER.path
  };
  #selectedRows;
  #selectedCells;
  get oldDataManager() {
    return this.#oldDataManager;
  }
  set oldDataManager(newValue) {
    this.#oldDataManager = newValue;
  }
  get dataManager() {
    return this.#dataManager;
  }
  set dataManager(newValue) {
    this.#dataManager = newValue;
  }
  get perspectiveDataManagerKey() {
    return this.#perspectiveDataManagerKey;
  }
  get perspective() {
    return this.#perspective;
  }
  get selectedRows() {
    return this.#selectedRows;
  }
  get selectedCells() {
    return this.#selectedCells;
  }
  /**
   * @field #changeEventMap - lookup table for change events and what function to call on that event
   */
  #changeEventMap = {
    [CHANGE_TYPES.add]: this.#addRecord,
    [CHANGE_TYPES.update]: this.#updateRecord,
    [CHANGE_TYPES.delete]: this.#deleteRecord,
    [CHANGE_TYPES.filter]: this.#filterRecords,
    [CHANGE_TYPES.refresh]: this.refresh,
    [CHANGE_TYPES.perspectiveChanged]: this.#updateFromPerspective,
    [CHANGE_TYPES.perspectiveRollback]: this.#perspectiveRollback
  };
  /**
   * @property dataManager - getter/setter for the dataManager property on what field to use as the id
   * @returns {*}
   */
  get #idField() {
    return dataManagers[this.#dataManager].idField;
  }
  /**
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * @method connectedCallback - called when the element is added to the DOM
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    await columnsFromChildren(this, this.#columnsManager);
    await formattingFromChildren(this);
    this.innerHTML = "";
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
    await crs.call("component", "notify_ready", { element: this });
  }
  /**
   * @method load - load resources and attach event listeners
   * @returns {Promise<unknown>}
   */
  load() {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        this.#dataManager = this.dataset["manager"];
        this.#perspective = this.dataset["perspective"];
        this.#perspectiveDataManagerKey = `${this.id}_${this.#perspective}`;
        await this.#hookDataManager();
        this.#keyboardInputManager = new KeyboardInputManager(this);
        this.#mouseInputManager = new MouseInputManager(this);
        if (this.dataset.filterable === "true") {
          await crs.call("data_table", "set_filter", { element: this, enabled: true });
        }
        if (this.dataset.resizeable === "true") {
          await crs.call("data_table", "set_resize", { element: this, enabled: true });
        }
        await crs.call("perspective", "register", { perspective: this.#perspective });
        resolve();
      });
    });
  }
  /**
   * @method disconnectedCallback - called when the element is removed from the DOM
   * @returns {Promise<void>}
   */
  async disconnectedCallback() {
    await crs.call("dom_interactive", "disable_resize", { element: this });
    await crs.call("perspective", "unregister", { perspective: this.#perspective });
    for (const extension of Object.values(DataTableExtensions)) {
      this.disposeExtension(extension.name);
    }
    this.#columnsManager = this.#columnsManager.dispose();
    await this.#unhookDataManager();
    this.#dataManagerChangedHandler = null;
    this.#inflationFn = null;
    this.#keyboardInputManager = this.#keyboardInputManager.dispose();
    this.#mouseInputManager = this.#mouseInputManager.dispose();
    this.#extensions = null;
    this.#oldDataManager = null;
    this.#dataManager = null;
    this.#perspective = null;
    this.#selectedRows = null;
    this.#selectedCells = null;
  }
  /**
   * @method disposeExtension - dispose of an extension
   * @param name - name of the extension
   * @param removeUI - remove the UI elements from the DOM
   * This is used when removing a extension without disposing the grid.
   * In that case you want to remove any UI the extension added to the DOM.
   * If you are disposing of the grid this is not required.
   */
  disposeExtension(name, removeUI = false) {
    if (this.#extensions[name].dispose != null) {
      this.#extensions[name] = this.#extensions[name].dispose(removeUI);
    }
  }
  /**
   * @private
   * @method #hoodDataManager - get the data manager and set the event listeners to be notified of change
   */
  async #hookDataManager() {
    await crs.call("data_manager", "on_change", {
      manager: this.#dataManager,
      callback: this.#dataManagerChangedHandler
    });
  }
  /**
   * @private
   * @method #unhookDataManager - remove the event listeners from the data manager
   */
  async #unhookDataManager() {
    await crs.call("data_manager", "remove_change", {
      manager: this.#dataManager,
      callback: this.#dataManagerChangedHandler
    });
  }
  /**
   * @private
   * @method dataManagerChanged - called when the data manager has changed
   * Update the table based on the change action (add, update, delete, refresh)
   * @param args {Object} - arguments from the data manager change event
   */
  async #dataManagerChanged(args) {
    if (args.action === CHANGE_TYPES.refresh && this.dataset.paged === "true")
      return;
    await this.#changeEventMap[args.action].call(this, args);
  }
  /**
   * @method #addRecord - add a record to the table where it was added in the data manager
   * @param args {Object} - arguments from the data manager change event
   * @returns {Promise<void>}
   */
  async #addRecord(args) {
  }
  /**
   * @method #updateRecord - update a record in the table where it was updated in the data manager
   * @param args {Object} - arguments from the data manager change event
   * @returns {Promise<void>}
   */
  async #updateRecord(args) {
  }
  /**
   * @method #deleteRecord - delete a record from the table where it was deleted in the data manager
   * @param args {Object} - arguments from the data manager change event
   * @returns {Promise<void>}
   */
  async #deleteRecord(args) {
  }
  /**
   * @method #filterRecords - the data manager performed a filter operation and these are the records you need to show
   * @param args {Object} - arguments from the data manager change event
   * @returns {Promise<void>}
   */
  async #filterRecords(args) {
  }
  /**
   * @method #buildTable - build the table from scratch by building the columns and rows in the HTML Table element
   * @param data {Array} - data to build the rows from
   * @returns {Promise<void>}
   */
  async #buildTable(data) {
    await this.#buildColumns();
    await this.#buildRows(data);
  }
  /**
   * @method #buildColumns - build the columns and headers in the HTML Table element
   * @returns {Promise<void>}
   */
  async #buildColumns() {
    this.style.setProperty("--columns", this.#columnsManager.gridTemplateColumns);
    const headers = await columnsHeadersFactory(this.#columnsManager.columns, this);
    this.shadowRoot.appendChild(headers);
  }
  /**
   * @method #buildRows - build the rows in the HTML Table element
   * @param data {Array} - data to build the rows from
   * @returns {Promise<void>}
   */
  async #buildRows(data) {
    await this.updateInflation();
    const fragment = document.createDocumentFragment();
    const createRowFn = rowFactory(this.#columnsManager.columns, this.#idField);
    for (const record of data) {
      const row = await createRowFn(record, fragment);
      this.#inflationFn(record, row);
    }
    this.shadowRoot.appendChild(fragment);
  }
  /**
   * @method #updateRows - update the rows in the HTML Table element
   * @param data
   * @returns {Promise<void>}
   */
  async #updateRows(data) {
    const rowElements = Array.from(this.shadowRoot.querySelectorAll("[data-id]"));
    const diff = data.length - rowElements.length;
    if (diff > 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < diff; i++) {
        const rowElement = rowElements[0].cloneNode(true);
        rowElements.push(rowElement);
        fragment.appendChild(rowElement);
      }
      this.shadowRoot.appendChild(fragment);
    }
    if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        const rowElement = rowElements.pop();
        rowElement.remove();
      }
    }
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const rowElement = rowElements[i];
      await this.#inflationFn(record, rowElement);
    }
  }
  /**
   * @method #updateFromPerspective - the perspective has changed, update accordingly
   * normally this means a refresh of what is currently on display
   * @returns {Promise<void>}
   */
  async #updateFromPerspective() {
    await crs.binding.events.emitter.postMessage(`[for="#${this.id}"]`, {
      action: "data-manager-changed",
      manager: this.#dataManager
    });
  }
  /**
   * @method #perspectiveRollback - the perspective has changed, update accordingly
   * This is fired from the perspective data manager to return to the origional data manager
   * @returns {Promise<void>}
   */
  async #perspectiveRollback() {
    this.#dataManager = this.#oldDataManager;
    await crs.binding.events.emitter.postMessage(`[for="#${this.id}"]`, {
      action: "data-manager-changed",
      manager: this.#dataManager
    });
  }
  /**
   * @method refresh - refresh the data
   * @param data {Array} - data to refresh the table with
   * if the data is null then the data manager will be used to get the all the data
   * but if you define the data in this parameter then the data manager will be ignored and you render what is given.
   * @returns {Promise<void>}
   */
  async refresh(data = null) {
    data ||= await crs.call("data_manager", "get_all", { manager: this.#dataManager });
    if (this.#inflationFn == null) {
      await this.#buildTable(data);
    } else {
      await this.#updateRows(data);
    }
  }
  /**
   * @method setExtension - you can enable or disable an extension here.
   * you can also just update the properties on a already loaded extension.
   * @param extName {String} - the name of the extension
   * @param settings {*} - the settings for the extension
   * @param enabled {Boolean} - if the extension is enabled or not
   * @returns {Promise<*>}
   */
  async setExtension(extName, settings, enabled) {
    const ext = this.#extensions[extName];
    const extType = typeof ext;
    if (extType === "string" && enabled === true) {
      this.#extensions[extName] = new (await import(ext)).default(this, settings);
      this.#extensions[extName].settings = settings;
      return;
    }
    if (extType === "object" && enabled === false) {
      return this.disposeExtension(extName, true);
    }
  }
  /**
   * @method callExtension - call a method on an extension
   * This is used by any code that wants to execute a method on an extension if that extension has been loaded.
   * If the extension is not loaded, the method will not be called
   * @param extName {String} - the name of the extension
   * @param method {String} - the name of the async method to call.
   * @param args {*} - the arguments to pass to the method
   * @returns {Promise<*>}
   */
  async callExtension(extName, method, args) {
    if (typeof this.#extensions[extName] !== "string") {
      return await this.#extensions[extName][method](args);
    }
  }
  /**
   * @method getColumnIndex - get the index of a column by its name
   * @param columnName {String} - the name of the column
   */
  getColumnIndex(columnName) {
    return this.#columnsManager.getColumnIndex(columnName);
  }
  /**
   * @method updateInflation - update the inflation function.
   * Call this when things like these happen.
   * - Formatting changes
   * - Column order changes
   * @returns {Promise<void>}
   */
  async updateInflation() {
    this.#inflationFn = await rowInflationFactory(this, this.#columnsManager.columns, this.#idField);
  }
  /**
   * @method addClickHandler - add a click handler to the table when you click on a element that matches a query to call the handler.
   * This is intended to be used in extensions thus a "protected" scope but can also be used externally if required.
   * @param query {String} - the query to match the element
   * @param handler {Function} - the handler to call when the element is clicked
   * @returns {Promise<void>}
   */
  async addClickHandler(query, handler) {
    await this.#mouseInputManager.addClickHandler(query, handler);
  }
  /**
   * @method removeClickHandler - remove a click handler from the table
   * @param query {String} - the query to match the element
   * @returns {Promise<void>}
   */
  async removeClickHandler(query) {
    await this.#mouseInputManager.removeClickHandler(query);
  }
}
customElements.define("data-table", DataTable);
export {
  DataTable
};
