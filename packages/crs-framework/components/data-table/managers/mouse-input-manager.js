class MouseInputManager {
  #table;
  #clickHandler = this.#click.bind(this);
  #dblclickHandler = this.#dblclick.bind(this);
  #lookupTable = {};
  constructor(table) {
    this.#table = table;
    this.#table.shadowRoot.addEventListener("click", this.#clickHandler);
    this.#table.shadowRoot.addEventListener("dblclick", this.#dblclickHandler);
  }
  dispose() {
    this.#table.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#table.shadowRoot.removeEventListener("dblclick", this.#dblclickHandler);
    this.#table = null;
    this.#clickHandler = null;
    this.#dblclickHandler = null;
    this.#lookupTable = null;
    return null;
  }
  async #click(event) {
    const target = event.composedPath()[0];
    for (const key of Object.keys(this.#lookupTable)) {
      if (target.matches(key)) {
        const action = this.#lookupTable[key];
        await action(event);
      }
    }
  }
  async #dblclick(event) {
  }
  /**
   * @method addClickHandler - Adds a click handler to the lookup table for click handling
   * @param query
   * @param action
   * @returns {Promise<void>}
   */
  async addClickHandler(query, action) {
    this.#lookupTable[query] = action;
  }
  async removeClickHandler(query) {
    delete this.#lookupTable[query];
  }
}
export {
  MouseInputManager
};
