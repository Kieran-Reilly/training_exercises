class InflationManager {
  #manager;
  #inflationFn;
  constructor(manager, inflationFn) {
    this.#manager = manager;
    this.#inflationFn = inflationFn;
  }
  dispose() {
    this.#manager = null;
    this.#inflationFn = null;
  }
  /**
   * @method inflate - Inflate an element.
   * Using the data manager, inflate this element with the data for that index.
   * The inflation fn can also decorate the element but cleanup will need to be done in that function.
   * This function is not responsible for any cleanup.
   * @param element {HTMLElement} - The element to inflate.
   * @param index {number} - The index of the data to inflate the element with.
   * @returns {Promise<void>}
   */
  async inflate(element, index) {
    const data = await crs.call("data_manager", "get", { manager: this.#manager, index });
    if (data != null) {
      await this.#inflationFn(element, data[0]);
    }
  }
}
export {
  InflationManager
};
