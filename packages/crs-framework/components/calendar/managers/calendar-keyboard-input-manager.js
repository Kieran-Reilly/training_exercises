class CalendarKeyboardInputManager {
  #calendar;
  #keydownHandler;
  #elements;
  #currentIndex;
  #columns;
  #currentViewType;
  #keyboardNavigation = {
    "ArrowRight": this.#arrowRight,
    "ArrowLeft": this.#arrowLeft,
    "ArrowUp": this.#arrowUp,
    "ArrowDown": this.#arrowDown,
    "Enter": this.#enter
  };
  #columnLength = {
    "months": this.#monthColumns,
    "years": this.#yearColumns,
    "default": this.#defaultColumns
  };
  #enterActions = {
    "months": this.#enterMonths,
    "years": this.#enterYears,
    "default": this.#enterDefault
  };
  set currentIndex(newValue) {
    this.#currentIndex = newValue;
  }
  constructor(calendar) {
    this.#calendar = calendar;
    this.#keydownHandler = this.#keydown.bind(this);
    this.#calendar.shadowRoot.addEventListener("keydown", this.#keydownHandler);
  }
  dispose() {
    this.#calendar.shadowRoot.removeEventListener("keydown", this.#keydownHandler);
    this.#calendar = null;
    this.#keydownHandler = null;
    this.#elements = null;
    this.#currentIndex = null;
    this.#columns = null;
    this.#currentViewType = null;
    this.#cleaner(this.#keyboardNavigation);
    this.#keyboardNavigation = null;
    this.#cleaner(this.#columnLength);
    this.#columnLength = null;
    this.#cleaner(this.#enterActions);
    this.#enterActions = null;
    return null;
  }
  async #keydown(event) {
    if (this.#keyboardNavigation[event.key]) {
      await this.#getCurrentViewType();
      await this.#getAllNodeElements();
      event.key !== "Enter" && (this.#elements[this.#currentIndex].tabIndex = -1);
      this.#keyboardNavigation[event.key].call(this, event);
    }
  }
  async #enter(event) {
    if (this.#currentViewType != null) {
      await this.#enterActions[this.#currentViewType].call(this, event);
    }
  }
  async #arrowRight(event) {
    this.#currentIndex = this.#currentIndex + 1 >= this.#elements.length ? this.#currentIndex : this.#currentIndex + 1;
    await this.#setTabIndexAndFocus();
  }
  async #arrowLeft(event) {
    const query = this.#currentIndex - 1 < 0 && this.#currentViewType === "default";
    if (query) {
      await this.#calendar.goToPrevious();
      this.#currentIndex = await this.#resetTabIndexOnRedraw("sub", 1);
    } else {
      this.#currentIndex = this.#currentIndex - 1 < 0 ? this.#currentIndex : this.#currentIndex - 1;
    }
    await this.#setTabIndexAndFocus();
  }
  async #arrowUp(event) {
    const query = this.#currentIndex - this.#columns < 0 && this.#currentViewType === "default";
    if (query) {
      await this.#calendar.goToPrevious();
      this.#currentIndex = await this.#resetTabIndexOnRedraw("sub", this.#columns);
    } else {
      this.#currentIndex = this.#currentIndex - this.#columns < 0 ? this.#currentIndex : this.#currentIndex - this.#columns;
    }
    await this.#setTabIndexAndFocus();
  }
  async #arrowDown(event) {
    const query = this.#currentIndex + this.#columns >= this.#elements.length && this.#currentViewType === "default";
    if (query) {
      await this.#calendar.goToNext();
      this.#currentIndex = await this.#resetTabIndexOnRedraw("add", this.#columns);
    } else {
      this.#currentIndex = this.#currentIndex + this.#columns >= this.#elements.length ? this.#currentIndex : this.#currentIndex + this.#columns;
    }
    await this.#setTabIndexAndFocus();
  }
  async #resetTabIndexOnRedraw(action, value) {
    await this.#getAllNodeElements();
    this.#calendar.calendars.querySelector("[tabindex='0']").tabIndex = -1;
    return action === "add" ? this.#currentIndex + parseInt(value) : this.#currentIndex - parseInt(value);
  }
  async #enterDefault(event) {
    await this.#calendar.selectedDate(null, event.composedPath()[0]);
  }
  async #enterMonths(event) {
    const target = event.composedPath()[0];
    if (isNaN(parseInt(target.dataset.value)) !== true) {
      await this.#calendar.selectedMonthChanged(parseInt(target.dataset.value));
    }
  }
  async #enterYears(event) {
    const target = event.composedPath()[0];
    if (isNaN(parseInt(target.dataset.value)) !== true) {
      await this.#calendar.selectedYearChanged(parseInt(target.dataset.value));
    }
  }
  async #setTabIndexAndFocus() {
    this.#elements[this.#currentIndex].tabIndex = 0;
    this.#elements[this.#currentIndex].focus();
    this.#currentViewType === "default" && await this.#dispatcher(this.#elements[this.#currentIndex]);
  }
  async #getAllNodeElements() {
    this.#elements = this.#calendar.shadowRoot.querySelectorAll("[role='cell'],[data-type='month-cell'],[data-type='year-cell']");
    this.#currentIndex = Array.prototype.findIndex.call(this.#elements, (el) => el.tabIndex === 0);
  }
  async #getCurrentViewType() {
    this.#currentViewType = this.#calendar.selectedView;
    if (this.#currentViewType != null) {
      await this.#columnLength[this.#currentViewType].call(this);
    }
  }
  async #defaultColumns() {
    this.#columns = 7;
  }
  async #monthColumns() {
    this.#columns = 3;
  }
  async #yearColumns() {
    this.#columns = 4;
  }
  async #dispatcher(element) {
    this.#calendar.dispatchEvent(new CustomEvent("change-month", {
      detail: element,
      bubbles: true,
      composed: true
    }));
  }
  #cleaner(object) {
    for (const key of Object.keys(object)) {
      object[key] = null;
    }
  }
}
export {
  CalendarKeyboardInputManager
};
