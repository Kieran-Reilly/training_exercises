class SizeManager {
  #itemSize;
  #itemCount;
  #containerSize;
  #contentHeight;
  #pageItemCount;
  #batchSize;
  /**
   * @property batchSize - The number of items to virtualize.
   * @returns {*}
   */
  get batchSize() {
    return this.#batchSize;
  }
  get itemCount() {
    return this.#itemCount;
  }
  /**
   * @property itemSize - The size of each item in the container.
   * @returns {*}
   */
  get itemSize() {
    return this.#itemSize;
  }
  /**
   * @property contentHeight - The height of all the content together.
   * This is used in determining how big the scrollbar should be.
   * @returns {*}
   */
  get contentHeight() {
    return this.#contentHeight;
  }
  /**
   * @property itemCount - The number of items that can fit in the container.
   * This is used in the virtualization to determine how many items to render.
   * @returns {*}
   */
  get pageItemCount() {
    return this.#pageItemCount;
  }
  /**
   * @constructor - Creates a new SizeManager.
   * @param itemSize - How high is an element in pixels, used for size calculations.
   * @param itemCount - How many items are there in total.
   * @param containerSize - How big is the container in pixels.
   */
  constructor(itemSize, itemCount, containerSize) {
    this.#itemSize = itemSize;
    this.#itemCount = itemCount;
    this.#containerSize = containerSize;
    this.#contentHeight = this.#itemSize * this.#itemCount;
    this.#pageItemCount = Math.ceil(containerSize / this.#itemSize);
    this.#batchSize = Math.floor(this.#pageItemCount / 2);
  }
  /**
   * @method dispose - clean up memory
   */
  dispose() {
    this.#itemSize = null;
    this.#itemCount = null;
    this.#containerSize = null;
    this.#contentHeight = null;
    this.#pageItemCount = null;
    this.#batchSize = null;
  }
  /**
   * @method getDataIndex - Returns the index of the data item that is at the top of the container.
   * @param scrollTop {number} - The current scroll position of the container.
   */
  getDataIndex(scrollTop) {
    const result = Math.floor(scrollTop / this.#itemSize);
    if (result > this.#itemCount) {
      return this.#itemCount;
    }
    return result;
  }
}
export {
  SizeManager
};
