import { DataTableExtensions } from "./../data-table-extensions.js";
class ResizeExtension {
  #settings;
  #table;
  #parent;
  #callbackHandler = this.#callback.bind(this);
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
    if (this.#parent) {
      crs.call("dom_interactive", "disable_resize", {
        element: this.#parent
      }).catch((error) => console.error(error));
      this.#parent = null;
    }
    if (removeUI === true) {
      const resizeElements = this.#table.element.querySelectorAll(".resize");
      for (const resizeElement of resizeElements) {
        resizeElement.remove();
      }
    }
    this.#callbackHandler = null;
    this.#settings = null;
    this.#table = null;
    return DataTableExtensions.RESIZE.path;
  }
  #enableResize(parent) {
    this.#parent = parent;
    crs.call("dom_interactive", "enable_resize", {
      element: parent,
      resize_query: ".resize",
      options: {
        lock_axis: "x",
        zIndex: "1",
        dropShadow: true,
        callback: this.#callbackHandler
      }
    }).catch((error) => console.error(error));
  }
  #callback(element) {
    const widths = getComputedStyle(this.#table).getPropertyValue("--columns").split(" ");
    const width = element.offsetWidth;
    const parentElement = element.parentElement || element.getRootNode();
    const index = Array.from(parentElement.children).indexOf(element);
    widths[index] = `${width}px`;
    this.#table.style.setProperty("--columns", widths.join(" "));
  }
  /**
   * @function initialize - add the resize elements to the column headers and enable the resize functionality.
   * @param columnsRow {HTMLElement} - The row containing the column headers.
   */
  initialize(columnsRow) {
    for (const column of columnsRow.children) {
      if (column.children.length == 0) {
        const text = column.textContent;
        const textDiv = document.createElement("div");
        textDiv.textContent = text;
        column.textContent = "";
        textDiv.classList.add("flex");
        column.appendChild(textDiv);
      }
      const resizeElement = document.createElement("div");
      resizeElement.classList.add("resize");
      resizeElement.textContent = "drag-vert-alt";
      column.appendChild(resizeElement);
    }
    this.#enableResize(columnsRow);
  }
}
export {
  ResizeExtension as default
};
