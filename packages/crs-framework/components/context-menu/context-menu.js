import "./../filter-header/filter-header.js";
import { buildElements } from "./utils/build-elements.js";
import { handleSelection } from "./utils/select-item-handler.js";
class ContextMenu extends crs.classes.BindableElement {
  #options;
  #point;
  #at;
  #anchor;
  #target;
  #clickHandler = this.#click.bind(this);
  #context;
  #process;
  #item;
  #margin;
  #templates;
  #filterCloseHandler = this.#filterClose.bind(this);
  #filterHeader;
  #isHierarchical = false;
  get shadowDom() {
    return true;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  async connectedCallback() {
    await super.connectedCallback();
    await this.load();
  }
  async load() {
    return new Promise(async (resolve) => {
      requestAnimationFrame(async () => {
        this.shadowRoot.addEventListener("click", this.#clickHandler);
        const ul = this.shadowRoot.querySelector(".popup");
        this.#isHierarchical = await buildElements.call(this, this.#options, this.#templates, this.#context, this.container);
        let at = "right";
        let anchor = "top";
        if (this.#target) {
          at = "bottom";
          anchor = "left";
        }
        await crs.call("fixed_layout", "set", {
          element: ul,
          target: this.#target,
          point: this.#point,
          at: this.#at || at,
          anchor: this.#anchor || anchor,
          margin: this.#margin || 0
        });
        if (this.#isHierarchical === false) {
          await crs.call("dom_interactive", "enable_resize", {
            element: this.popup,
            resize_query: "#resize",
            options: {}
          });
        }
        this.#filterHeader = this.shadowRoot.querySelector("filter-header");
        this.#filterHeader.addEventListener("close", this.#filterCloseHandler);
        await crs.call("component", "notify_ready", { element: this });
        resolve();
      });
    });
  }
  async disconnectedCallback() {
    await crs.call("dom_interactive", "disable_resize", {
      element: this.popup
    });
    this.#filterHeader.removeEventListener("close", this.#filterCloseHandler);
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#filterHeader = null;
    this.#filterCloseHandler = null;
    this.#clickHandler = null;
    this.#options = null;
    this.#point = null;
    this.#at = null;
    this.#anchor = null;
    this.#target = null;
    this.#context = null;
    this.#process = null;
    this.#item = null;
    this.#margin = null;
    this.#templates = null;
    this.#isHierarchical = null;
    await super.disconnectedCallback();
  }
  async #click(event) {
    const target = event.composedPath()[0];
    if (target.matches(".back")) {
      return await this.#filterClose();
    }
    await handleSelection(event, this.#options, this, this.#filterHeader);
  }
  async #filterClose(event) {
    await crs.call("context_menu", "close");
  }
  /**
   * @method setOptions - Sets the options for the context menu.
   * This is used by the action system to pass information to the context menu that it needs to render the content.
   * @param args {Object} - The options for the context menu.
   * @param args.options {Array} - An array of options to display in the context menu.
   * @param [args.point] {Object} - The point to position the context menu at.
   * @param [args.at] {String} - The position of the context menu relative to the point. (top, bottom, left, right)
   * @param [args.anchor] {String} - The position of the point relative to the context menu. (top, bottom, left, right)
   * @param [args.target] {HTMLElement} - The target element to position the context menu relative to.
   * @param [args.context] {Object} - The context to use when inflating the context menu. used to execute a process with the menu item.
   * @param [args.process] {String} - The process to call when an option is selected. used to execute a process with the menu item.
   * @param [args.item] {Object} - The item to pass to the process when an option is selected. used to execute a process with the menu item.
   * @param [args.margin] {Number} - The margin to use when positioning the context menu.
   * @param [args.templates] {Object} - The templates to use when rendering the context menu.
   * @param [args.height] {String} - The default height of the context menu.
   * @param [args.style] {Object} - The style to apply to the context menu.
   *
   * Relative to a component:
   * - set target to the component
   * - set at to the location of the context menu relative to the component
   * - set anchor to the align the menu to the component. for example if align is "top" the top of the component and the top of the menu will be the same.
   * - set margin to the distance between the component and the menu.
   *
   * Relative to a point:
   * - set point to the point to position the menu at.
   */
  setOptions(args) {
    this.#options = args.options;
    this.#point = args.point;
    this.#at = args.at;
    this.#anchor = args.anchor;
    this.#target = args.target;
    this.#context = args.context;
    this.#process = args.process;
    this.#item = args.item;
    this.#margin = args.margin;
    this.#templates = args.templates;
    if (typeof args.height == "number") {
      args.height = `${args.height}px`;
    }
    this.style.setProperty("--height", args.height);
    if (args.style != null) {
      for (const key of Object.keys(args.style)) {
        this.style.setProperty(key, args.style[key]);
      }
    }
  }
}
customElements.define("context-menu", ContextMenu);
