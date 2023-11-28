class CollectionSelectionManager {
  #containerElement;
  #masterQuery;
  #selectionQuery;
  #groupQuery;
  #manager;
  #virtualizedElement;
  #clickHandler = this.#click.bind(this);
  /**
   * @constructor
   * @param element - the element that contains the collection of items and that will also limit the query selection for UI
   * @param masterQuery - the query that will be used to determine if an element is a master element (select all or none)
   * @param selectionQuery - the query that will be used to determine if an element is a selection element (select one)
   * @param manager - the data manager that will be used to update the selection state
   */
  constructor(element, masterQuery, selectionQuery, groupQuery, manager, virtualizedElement) {
    this.#containerElement = element;
    this.#masterQuery = masterQuery;
    this.#selectionQuery = selectionQuery;
    this.#groupQuery = groupQuery;
    this.#manager = manager;
    this.#virtualizedElement = virtualizedElement;
    this.#containerElement.addEventListener("click", this.#clickHandler);
  }
  dispose() {
    this.#containerElement.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
    this.#containerElement = null;
    this.#masterQuery = null;
    this.#selectionQuery = null;
    this.#manager = null;
    this.#groupQuery = null;
    this.#virtualizedElement = null;
    return null;
  }
  #isMasterElement(element) {
    return element.matches(this.#masterQuery);
  }
  #isSelectionElement(element) {
    return element.matches(this.#selectionQuery);
  }
  #isGroupElement(element) {
    return element.dataset.group !== void 0;
  }
  async #click(event) {
    const checkbox = getCheckbox(event.composedPath()[0]);
    if (checkbox == null)
      return;
    const checked = checkbox.getAttribute("aria-checked") === "true";
    const id = checkbox.dataset.id;
    const index = checkbox.dataset.index;
    if (this.#isMasterElement(checkbox)) {
      return await this.#selectedAll(checked);
    }
    if (this.#isSelectionElement(checkbox)) {
      return await this.#selected(checkbox, id, index, checked);
    }
  }
  /**
   * Mark all the records as selected or not selected based on the checked value
   * @param checked {boolean} - true if all records should be selected, false if all records should be unselected
   */
  async #selectedAll(selected) {
    await crs.call("data_manager", "set_select_all", {
      manager: this.#manager,
      selected
    });
    if (this.#virtualizedElement) {
      await this.#virtualizedElement.__virtualizationManager.refreshCurrent();
    }
  }
  /**
   * Mark all the records for a group
   * @param groupId
   * @param checked
   * @returns {Promise<void>}
   */
  async #selectedGroup(element, checked) {
  }
  async #selected(element, id, index, selected) {
    const ids = id == null ? [] : [Number(id)];
    const indexes = index == null ? [] : [Number(index)];
    await crs.call("data_manager", "set_selected", {
      manager: this.#manager,
      ids,
      indexes,
      selected
    });
    const isAllSelected = await crs.call("data_manager", "is_all_selected", {
      manager: this.#manager
    });
    const parentElement = this.#containerElement.shadowRoot ?? this.#containerElement;
    const masterElement = parentElement.querySelector(this.#masterQuery);
    masterElement.checked = isAllSelected;
  }
}
function getCheckbox(element) {
  if (element.matches("check-box")) {
    return element;
  }
  const shadowRoot = element.getRootNode();
  if (shadowRoot.host == null)
    return null;
  if (shadowRoot.host.matches("check-box")) {
    return shadowRoot.host;
  }
  return null;
}
export {
  CollectionSelectionManager
};
