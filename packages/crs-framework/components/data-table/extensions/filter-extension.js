import { DataTableExtensions } from "./../data-table-extensions.js";
import "./../../../src/actions/virtualization-actions.js";
import "./../../../src/actions/collection-selection-actions.js";
import "./../../checkbox/checkbox.js";
import "./filter-extension/update-filter.js";
import { updateFilter } from "./filter-extension/update-filter.js";
const FILTER_EXTENSION_DATA_MANAGER = "filter-extension";
class FilterExtension {
  #settings;
  #table;
  #parent;
  #currentField;
  #currentDataType;
  #filterHandler = this.#filter.bind(this);
  #lookupTable = {};
  #callbackHandler = this.#callback.bind(this);
  #dialog = null;
  #itemTemplate = null;
  #backupData = null;
  #isSaving = false;
  /**
   * @constructor
   * @param table {DataTable} - The data table to add the resize elements to.
   * @param settings {Object} - The settings for the resize extension.
   */
  constructor(table, settings) {
    this.#settings = settings;
    this.#table = table;
  }
  dispose(removeUI) {
    this.#table.removeClickHandler(".filter");
    this.#isSaving = null;
    this.#settings = null;
    this.#itemTemplate = null;
    this.#currentField = null;
    this.#currentDataType = null;
    this.#callbackHandler = null;
    this.#dialog = null;
    this.#filterHandler = null;
    this.#lookupTable = null;
    this.#backupData = null;
    if (this.#parent) {
      this.#parent = null;
    }
    if (removeUI === true) {
      const filterElements = this.#table.element.querySelectorAll(".filter");
      for (const filterElement of filterElements) {
        filterElement.remove();
      }
    }
    this.#table = null;
    return DataTableExtensions.FILTER.path;
  }
  initialize(columnsRow) {
    this.#table.addClickHandler(".filter", this.#filterHandler.bind(this));
    for (const column of columnsRow.children) {
      if (column.children.length === 0) {
        const text = column.textContent;
        const textDiv = document.createElement("div");
        textDiv.textContent = text;
        column.textContent = "";
        textDiv.classList.add("flex");
        column.appendChild(textDiv);
      }
      const filterElement = document.createElement("div");
      filterElement.classList.add("filter");
      filterElement.textContent = "filter-outline";
      column.appendChild(filterElement);
    }
  }
  /**
   * @private - filter handler
   * @method #filter - when you click on the filter icon, this will show the filter options.
   * @param event
   * @returns {Promise<void>}
   */
  async #filter(event) {
    const columnCellElement = event.composedPath()[1];
    this.#currentField = columnCellElement.dataset.field;
    this.#currentDataType = columnCellElement.dataset.type || "string";
    await this.#showFilterOptions(columnCellElement);
  }
  /**
   * @private
   * @method #showFilterOptions - show a dialog that will contain the filter options to update
   * @param relativeElement {HTMLElement} - the element to position the dialog relative to.
   * @param filterOptions {array} - the filter options to show.
   * @returns {Promise<void>}
   */
  async #showFilterOptions(relativeElement) {
    const headerUrl = import.meta.url.replace(".js", "/header.html");
    const bodyUrl = import.meta.url.replace(".js", "/body.html");
    const footerUrl = import.meta.url.replace(".js", "/footer.html");
    const itemTemplateUrl = import.meta.url.replace(".js", "/item-template.html");
    const headerTemplate = await crs.call("html", "template_from_file", { url: headerUrl, has_css: true });
    const bodyTemplate = await crs.call("html", "template_from_file", { url: bodyUrl, has_css: true });
    const footerTemplate = await crs.call("html", "template_from_file", { url: footerUrl });
    this.#itemTemplate = await crs.call("html", "template_from_file", { url: itemTemplateUrl });
    this.#dialog = await crs.call("dialog", "show", {
      target: relativeElement,
      position: "bottom",
      anchor: "left",
      allow_resize: false,
      allow_move: false,
      min_height: "400px",
      min_width: "250px",
      header: headerTemplate.content.cloneNode(true),
      main: bodyTemplate.content.cloneNode(true),
      footer: footerTemplate.content.cloneNode(true),
      callback: this.#callbackHandler
    });
  }
  async #restoreBackup() {
    if (this.#isSaving === false) {
      this.#lookupTable[this.#currentField] = this.#backupData;
    }
    this.#backupData = null;
    this.#isSaving = false;
  }
  async #callback(args) {
    if (args.action === "loaded") {
      await this.#loadFilterOptions();
      return;
    }
    if (args.action === "accept") {
      this.#isSaving = true;
      if (this.#table.dataManager !== this.#table.perspectiveDataManagerKey) {
        await crs.call("data_manager", "register", {
          manager: this.#table.perspectiveDataManagerKey,
          id_field: this.#table.idField,
          type: "perspective",
          source_manager: this.#table.dataManager,
          perspective: this.#table.perspective
        });
        this.#table.oldDataManager = this.#table.dataManager;
        this.#table.dataManager = this.#table.perspectiveDataManagerKey;
      }
      await updateFilter(this.#table.perspective, this.#currentField, this.#currentDataType, FILTER_EXTENSION_DATA_MANAGER);
      const isNotDone = await this.#dialog.close();
      if (isNotDone === false) {
        this.#dialog = null;
      }
      return;
    }
    if (args.action === "close") {
      await this.#restoreBackup();
      await this.#disposeManagers();
    }
    if (args.action === "show-hide-selection") {
      console.log("show / hide selection");
    }
  }
  async #createDataManager(data) {
    const selectedIndexes = [];
    data.forEach((model, index) => {
      if (model._selected === true) {
        selectedIndexes.push(index);
      }
    });
    return await crs.call("data_manager", "register", {
      manager: FILTER_EXTENSION_DATA_MANAGER,
      id_field: "id",
      type: "memory",
      records: data,
      selected_indexes: selectedIndexes
    });
  }
  async #disposeManagers() {
    const layout = this.#dialog.querySelector(".layout");
    const container = this.#dialog.querySelector("#filter-list");
    await crs.call("collection_selection", "disable", {
      element: layout
    });
    await crs.call("data_manager", "dispose", {
      manager: FILTER_EXTENSION_DATA_MANAGER
    });
    await crs.call("virtualization", "disable", {
      element: container
    });
  }
  #inflationFn(element, data) {
    element.dataset.value = data.value;
    const checkbox = element.querySelector("check-box");
    checkbox.checked = data._selected || false;
    checkbox.dataset.index = data._index;
    element.querySelector(".title").textContent = data.value;
    element.querySelector(".count").textContent = data.count;
  }
  async #loadFilterOptions() {
    const message = await crs.call("translations", "get", { key: "system.loadingMessage" });
    const container = await this.#dialog.querySelector("#filter-list");
    await crs.call("busy_ui", "show", {
      // JHR: todo - make this use a animation frame so the UI updates before the rest of the code runs.
      "element": container,
      "message": message
    });
    let displayData = this.#lookupTable[this.#currentField];
    if (displayData == null) {
      const dataManager = this.#table.dataManager;
      const data = await crs.call("data_manager", "get_all", { manager: dataManager });
      const uniqueValues = await crs.call("data_processing", "unique_values", {
        source: data,
        fields: [this.#currentField]
      });
      this.#lookupTable[this.#currentField] = UniqueObjectToFilterArray(uniqueValues[this.#currentField]);
      displayData = this.#lookupTable[this.#currentField];
    }
    this.#backupData = JSON.parse(JSON.stringify(displayData));
    await this.#createDataManager(displayData);
    await crs.call("busy_ui", "hide", {
      "element": container
    });
    await crs.call("virtualization", "enable", {
      element: container,
      manager: FILTER_EXTENSION_DATA_MANAGER,
      itemSize: 32,
      template: this.#itemTemplate,
      inflation: this.#inflationFn
    });
    const layout = this.#dialog.querySelector(".layout");
    await crs.call("collection_selection", "enable", {
      element: layout,
      master_query: "#master-checkbox",
      selection_query: '[role="checkbox"]',
      virtualized_element: container,
      manager: FILTER_EXTENSION_DATA_MANAGER
    });
  }
}
function UniqueObjectToFilterArray(uniqueValues) {
  const filterArray = [];
  for (const key of Object.keys(uniqueValues)) {
    filterArray.push({
      value: key,
      count: uniqueValues[key],
      _selected: true
    });
  }
  return filterArray;
}
export {
  FilterExtension as default
};
