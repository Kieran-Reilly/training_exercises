import { SizeManager } from "./size-manager.js";
import { InflationManager } from "./inflation-manager.js";
import { ScrollManager } from "../scroll-manager/scroll-manager.js";
class VirtualizationManager {
  #sizeManager;
  #element;
  #itemTemplate;
  #rowMap = {};
  #topIndex = 0;
  #bottomIndex = 0;
  #virtualSize = 0;
  #inflationManager;
  #scrollManager;
  #syncPage = false;
  #scrollTop = 0;
  /**
   * @constructor
   * @param element {HTMLElement} - The element to enable virtualization on.
   * @param itemTemplate {HTMLTemplateElement} - The template to use for each item.
   * @param inflationFn {function} - The function to call when an item is inflated.
   * @param dataManager {string} - The data manager to use.
   * @param itemCount {number} - The number of items.
   * @param itemSize {number} - The size of each item.
   */
  constructor(element, itemTemplate, inflationFn, dataManager, itemSize) {
    this.#element = element;
    this.#itemTemplate = itemTemplate;
    this.#inflationManager = new InflationManager(dataManager, inflationFn);
    const bounds = this.#element.getBoundingClientRect();
    crs.call("data_manager", "record_count", { manager: dataManager }).then((itemCount) => {
      this.#sizeManager = new SizeManager(itemSize, itemCount, bounds.height);
      this.#virtualSize = Math.floor(this.#sizeManager.pageItemCount / 2);
      this.#scrollManager = new ScrollManager(
        this.#element,
        null,
        this.#onScroll.bind(this),
        this.#onEndScroll.bind(this),
        this.#sizeManager.itemSize
      );
      this.#initialize();
    });
  }
  /**
   * @method dispose - clean up memory.
   */
  dispose() {
    for (const key of Object.keys(this.#rowMap)) {
      this.#rowMap[key] = null;
    }
    this.#sizeManager = this.#sizeManager.dispose();
    this.#scrollManager = this.#scrollManager.dispose();
    this.#inflationManager = this.#inflationManager.dispose();
    this.#rowMap = null;
    this.#element = null;
    this.#itemTemplate = null;
    this.#topIndex = null;
    this.#bottomIndex = null;
    this.#virtualSize = null;
    this.#sizeManager = null;
    this.#inflationManager = null;
    this.#scrollManager = null;
    this.#syncPage = null;
    this.#scrollTop = null;
    return null;
  }
  /**
   * @private
   * @method #initialize - create resources required for the virtualization to work.
   * That includes the element that will be used for the virtualization.
   */
  #initialize() {
    this.#element.style.position = "relative";
    this.#element.style.overflowY = "auto";
    this.#element.style.willChange = "transform";
    this.#createItems();
    this.#createMarker();
  }
  /**
   * @private
   * @method #createMarker - Creates the marker element that will be used to determine the scroll position.
   */
  #createMarker() {
    const marker = document.createElement("div");
    marker.id = "marker";
    marker.style.height = `1px`;
    marker.style.width = "1px";
    marker.style.position = "absolute";
    marker.style.top = "0";
    marker.style.left = "0";
    marker.style.translate = `${0}px ${this.#sizeManager.contentHeight}px`;
    this.#element.appendChild(marker);
  }
  /**
   * @private
   * @method #createItems - Creates the items that will be used for the virtualization.
   */
  #createItems() {
    const fragment = document.createDocumentFragment();
    let childCount = this.#sizeManager.pageItemCount + this.#virtualSize * 2;
    for (let i = -this.#virtualSize; i < childCount - this.#virtualSize; i++) {
      const top = i * this.#sizeManager.itemSize;
      const clone = this.#itemTemplate.content.cloneNode(true);
      const element = clone.firstElementChild;
      element.style.position = "absolute";
      element.style.top = "0";
      element.style.right = "4px";
      element.style.left = "4px";
      element.style.willChange = "translate";
      if (i >= 0) {
        this.#inflationManager.inflate(element, i);
      }
      this.#setTop(element, top);
      fragment.appendChild(clone);
    }
    this.#element.appendChild(fragment);
    this.#initializeRowMap();
    this.#topIndex = -this.#virtualSize;
    this.#bottomIndex = childCount - 1 - this.#virtualSize;
  }
  /**
   * @private
   * @method #initializeRowMap - Creates a map of the elements that are currently visible.
   * This is used internally to keep the order of items on screen without having to change the DOM.
   */
  #initializeRowMap() {
    for (let i = 0; i < this.#element.children.length; i++) {
      const index = -this.#virtualSize + i;
      this.#rowMap[index] = this.#element.children[i];
    }
  }
  /**
   * @private
   * @method setTop - Sets the top position of an element by changing the transform.
   * It also does some rudimentary checks to make sure the element is not out of bounds.
   * @param element {HTMLElement} - The element to set the top position on.
   * @param top {number} - The top position to set.
   */
  #setTop(element, top) {
    if (top >= this.#sizeManager.contentHeight) {
      top = -this.#sizeManager.itemSize * 2;
    }
    element.style.transform = `translate(0, ${top}px)`;
  }
  /**
   * @private
   * @method #onScrollDown - This is called when the scroll event fires to perform scroll operations up or down.
   * We first check the quantity of items scrolled. If it is greater than the virtual size cache we don't do anything.
   * The user in that scenario is jumping pages and once the scroll ends we will sync the page.
   * @param event {Event} - The scroll event.
   * @param scrollTop {number} - The current scroll top position.
   * @param scrollOffset {number} - How big was the jump between the previous scroll and this one.
   * @param direction {string} - The direction of the scroll. Either "up" or "down".
   * @returns {Promise<void>}
   */
  async #onScroll(event, scrollTop, scrollOffset, direction) {
    const itemsScrolled = Math.floor(scrollOffset / this.#sizeManager.itemSize);
    const topIndex = Math.floor(scrollTop / this.#sizeManager.itemSize);
    if (itemsScrolled <= this.#virtualSize) {
      this.#syncPage = false;
      if (direction === "down") {
        await this.#onScrollDown(topIndex, itemsScrolled);
      } else {
        await this.#onScrollUp(topIndex, itemsScrolled);
      }
    } else {
      this.#syncPage = true;
    }
  }
  /**
   * @private
   * @method #onScrollDown - This is called when the scroll event fires to perform scroll operations down.
   * @param scrollTopIndex {number} - The current scroll top index.
   * @returns {Promise<void>}
   */
  async #onScrollDown(scrollTopIndex) {
    const count = scrollTopIndex - this.#topIndex;
    const toMove = count - this.#virtualSize;
    const startIndex = this.#topIndex;
    const endIndex = startIndex + toMove;
    for (let i = startIndex; i < endIndex; i++) {
      const element = this.#rowMap[i];
      const newIndex = this.#bottomIndex + 1;
      await this.#scrollPropertiesUpdate(element, newIndex, i, 1);
    }
  }
  /**
   * @private
   * @method #onScrollUp - This is called when the scroll event fires to perform scroll operations up.
   * @param scrollTopIndex {number} - The current scroll top index.
   * @returns {Promise<void>}
   */
  async #onScrollUp(scrollTopIndex) {
    const count = scrollTopIndex - this.#topIndex;
    const toMove = Math.abs(count - this.#virtualSize);
    const startIndex = this.#bottomIndex;
    const endIndex = startIndex - toMove;
    for (let i = startIndex; i > endIndex; i--) {
      const element = this.#rowMap[i];
      const newIndex = this.#topIndex - 1;
      if (newIndex < 0) {
        return;
      }
      await this.#scrollPropertiesUpdate(element, newIndex, i, -1);
    }
  }
  /**
   * @private
   * @method #scrollPropertiesUpdate - Updates the properties after it has been scrolled.
   * This would include:
   * - #rowMap swapping of the element from old to new position
   * - updating the dom by moving the element and inflating it
   * - updating the top and bottom index
   * @param element {HTMLElement} - The element to update.
   * @param newIndex {number} - The new index of the element.
   * @param dataIndex {number} - The old index of the element.
   * @param indexOffset {number} - +1 or -1 depending on the direction of the scroll to update the top and bottom index.
   * @returns {Promise<void>}
   */
  async #scrollPropertiesUpdate(element, newIndex, dataIndex, indexOffset) {
    this.#rowMap[newIndex] = element;
    delete this.#rowMap[dataIndex];
    if (newIndex <= this.#sizeManager.itemCount) {
      this.#setTop(element, newIndex * this.#sizeManager.itemSize);
      await this.#inflationManager.inflate(element, newIndex);
    }
    this.#bottomIndex += indexOffset;
    this.#topIndex += indexOffset;
  }
  /**
   * @private
   * @method #onEndScroll - This is called when the scroll event ends.
   * This checks if we have jumped pages and if it did jump pages it will sync the page.
   * @param event {Event} - The scroll event.
   * @param scrollTop {number} - The current scroll top position.
   * @returns {Promise<void>}
   */
  async #onEndScroll(event, scrollTop) {
    if (this.#syncPage) {
      await this.#performSyncPage(scrollTop);
    }
    this.#scrollTop = scrollTop;
  }
  /**
   * @private
   * @method #performSyncPage - This is called when the scroll event ends and, we have jumped pages.
   * The elements are moved so that you have a top buffer, bottom buffer and elements on page again.
   * This is an expensive operation because it affects all the elements.
   * Because it is so expensive, we don't do this on scroll but only on scroll end.
   * @param scrollTop {number} - The current scroll top position.
   * @returns {Promise<void>}
   */
  async #performSyncPage(scrollTop) {
    const topIndex = Math.floor(scrollTop / this.#sizeManager.itemSize) - this.#virtualSize;
    let count = 0;
    const newMap = {};
    for (let i = this.#topIndex; i <= this.#bottomIndex; i++) {
      const element = this.#rowMap[i];
      const newIndex = topIndex + count;
      newMap[newIndex] = element;
      count++;
      if (newIndex <= this.#sizeManager.itemCount) {
        const newTop = newIndex * this.#sizeManager.itemSize;
        this.#setTop(element, newTop);
        await this.#inflationManager.inflate(element, newIndex);
      }
    }
    this.#rowMap = newMap;
    this.#topIndex = topIndex;
    this.#bottomIndex = topIndex + count - 1;
  }
  async refreshCurrent() {
    await this.#performSyncPage(this.#scrollTop);
  }
}
export {
  VirtualizationManager
};
