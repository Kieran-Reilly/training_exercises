import { CHANGE_TYPES } from "../../src/managers/data-manager/data-manager-types.js";
import { loadHTML } from "./../../src/load-resources.js";
class PageToolbar extends HTMLElement {
  #recordCount = 0;
  #lastPage;
  #dataManager;
  #dataManagerChangedHandler = this.#dataManagerChanged.bind(this);
  #clickHandler = this.#click.bind(this);
  #changeHandler = this.#change.bind(this);
  #edtPageSize;
  #edtPageNumber;
  get lastPage() {
    return this.#lastPage;
  }
  /**
   * @property pageSize - the number of rows to display per page
   * You can get and set this property.
   * It is made public so that it has access via the process api.
   * Internal logic for managing page size will still be enforced.
   * @returns {*}
   */
  get pageSize() {
    return Number(this.#edtPageSize.value);
  }
  set pageSize(newValue) {
    newValue = Number(newValue);
    if (newValue < 1) {
      newValue = 1;
    }
    this.#edtPageSize.value = Number(newValue);
  }
  get pageNumber() {
    return Number(this.#edtPageNumber.value || 1);
  }
  set pageNumber(newValue) {
    newValue = Number(newValue);
    if (newValue < 1) {
      newValue = 1;
    }
    if (newValue > this.#lastPage) {
      newValue = this.#lastPage;
    }
    this.#edtPageNumber.value = newValue;
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
        this.setAttribute("role", "toolbar");
        this.#edtPageSize = this.shadowRoot.querySelector("#edtPageSize");
        this.#edtPageNumber = this.shadowRoot.querySelector("#edtPageNumber");
        this.#dataManager = this.dataset["manager"];
        await this.#translate();
        this.#dataManager = this.dataset["manager"];
        await this.#hookDataManager();
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        this.shadowRoot.addEventListener("change", this.#changeHandler);
        resolve();
      });
    });
  }
  /**
   * @method disconnectedCallback - called when the element is removed from the DOM
   * @returns {Promise<void>}
   */
  async disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.shadowRoot.removeEventListener("change", this.#changeHandler);
    await this.#unhookDataManager();
    this.#dataManagerChangedHandler = null;
    this.#clickHandler = null;
    this.#changeHandler = null;
    this.#edtPageSize = null;
    this.#edtPageNumber = null;
    this.#dataManager = null;
    this.#lastPage = null;
    this.#recordCount = null;
  }
  async #translate() {
    const element = this.shadowRoot.querySelector("#divLabel");
    await crs.binding.translations.parseElement(element);
  }
  /**
   * @private
   * @method #hoodDataManager - get the data manager and set the event listeners to be notified of change
   */
  async #hookDataManager() {
    const element = this.getRootNode().querySelector(this.getAttribute("for"));
    element.dataset.paged = true;
    this.#dataManager = element.dataset.manager;
    await crs.call("data_manager", "on_change", {
      manager: this.#dataManager,
      callback: this.#dataManagerChangedHandler
    });
    this.#recordCount = await crs.call("data_manager", "record_count", { manager: this.#dataManager });
    if (this.#recordCount < this.pageSize) {
      this.pageSize = this.#recordCount;
    }
    this.#calculateLastPage();
    if (this.#recordCount > 0) {
      await crs.call("component", "on_ready", {
        element,
        callback: async () => {
          await this.#updatePage();
        },
        caller: this
      });
    }
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
  async #dataManagerChanged(args) {
    if (args.action == CHANGE_TYPES.refresh) {
      this.#recordCount = args.count;
      this.#calculateLastPage();
      await this.#updatePage();
    }
  }
  async #click(event) {
    if (event == null)
      return;
    const target = event.composedPath()[0];
    const fn = {
      "gotoFirstPage": this.#gotoFirstPage,
      "gotoPreviousPage": this.#gotoPreviousPage,
      "gotoNextPage": this.#gotoNextPage,
      "gotoLastPage": this.#gotoLastPage
    }[target.id];
    await fn?.call(this);
  }
  async #change(event) {
    if (event == null)
      return;
    const target = event.composedPath()[0];
    const fn = {
      "pageSize": this.#pageSizeChanged,
      "edtPageNumber": this.#pageNumberChanged
    }[target.dataset.property];
    await fn?.call(this, target.value);
  }
  async #pageSizeChanged(value) {
    if (value > 100) {
      return this.pageSize = 100;
    }
    if (value < 1) {
      return this.pageSize = 1;
    }
    if (value > this.#recordCount) {
      return this.pageSize = this.#recordCount;
    }
    this.pageSize = value;
    this.#calculateLastPage();
    await this.#updatePage();
  }
  async #pageNumberChanged(value) {
    if (value < 1) {
      value = 1;
    }
    if (value > this.#lastPage) {
      value = this.#lastPage;
    }
    this.pageNumber = value;
    await this.#updatePage();
  }
  /**
   * @method #gotoFirstPage - go to the first page of the data and notify the target component
   */
  async #gotoFirstPage() {
    this.pageNumber = 1;
    await this.#updatePage();
  }
  /**
   * @method #gotoPreviousPage - go to the previous page of the data and notify the target component
   */
  async #gotoPreviousPage() {
    this.pageNumber -= 1;
    await this.#updatePage();
  }
  /**
   * @method #gotoNextPage - go to the next page of the data and notify the target component
   */
  async #gotoNextPage() {
    this.pageNumber += 1;
    await this.#updatePage();
  }
  /**
   * @method #gotoLastPage - go to the last page of the data and notify the target component
   */
  async #gotoLastPage() {
    this.pageNumber = this.#lastPage;
    await this.#updatePage();
  }
  /**
   * @method notifyRefresh - notify the component that the data has been refreshed
   * use the for attribute to get the query of what component to target.
   * the use that element's refresh method to refresh the data
   */
  async #updatePage() {
    this.shadowRoot.querySelector("#edtPageNumber").value = this.pageNumber;
    const target = this.getRootNode().querySelector(this.getAttribute("for"));
    const data = await crs.call("data_manager", "get_page", {
      manager: this.#dataManager,
      page: this.pageNumber,
      size: this.pageSize
    });
    target?.refresh(data);
  }
  /**
   * This calculates what the last page number is based on the record count and the page size
   */
  #calculateLastPage() {
    this.#lastPage = Math.ceil(this.#recordCount / this.pageSize);
    if (this.#lastPage < 1) {
      this.#lastPage = 1;
    }
    this.shadowRoot.querySelector("#divPageCount").textContent = this.#lastPage;
    this.shadowRoot.querySelector("#divTotalCount").textContent = this.#recordCount;
  }
  /**
   * provide a decoupled way of accept communicating changes
   * @param args
   */
  async onMessage(args) {
    switch (args.action) {
      case "data-manager-changed": {
        this.#dataManager = args.manager;
        const count = (await crs.call("data_manager", "get_counts", { manager: this.#dataManager })).total;
        await this.#dataManagerChangedHandler({
          action: CHANGE_TYPES.refresh,
          count
        });
        break;
      }
    }
  }
}
customElements.define("page-toolbar", PageToolbar);
export {
  PageToolbar
};
