import { addColumnFeatures } from "./columns.js";
class KanBan extends crs.classes.BindableElement {
  #columns = [];
  #refreshHandler = this.refresh.bind(this);
  #allowDropHandler = this.#allowDrop.bind(this);
  #onDropHandler = this.#onDrop.bind(this);
  get shadowDom() {
    return true;
  }
  get columns() {
    return this.#columns;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  async connectedCallback() {
    await super.connectedCallback();
    addColumnFeatures(this);
    await this.#enableDragDrop();
    await this.#initialDraw();
  }
  async disconnectedCallback() {
    await this.#disableDragDrop();
    for (const column of this.#columns) {
      column.container = null;
    }
    this.#columns = null;
    this.#allowDropHandler = null;
    this.#onDropHandler = null;
    this.#refreshHandler = null;
    await super.disconnectedCallback();
  }
  async #initialDraw() {
    await this.observe_changes();
    await this.refresh();
  }
  async #clear() {
    const items = this.container.querySelectorAll("[data-id]");
    for (let item of items) {
      item.parentElement.removeChild(item);
    }
  }
  async #addInstancesToUI(instances) {
    const value_map = {};
    while (instances.children.length > 0) {
      const child = instances.firstElementChild;
      child.setAttribute("role", "cell");
      const value = child.dataset.value;
      if (value_map[value] == null) {
        value_map[value] = this.#columns.find((item) => item[this.dataset.field] == value).container;
      }
      child.parentNode.removeChild(child);
      value_map[value].appendChild(child);
    }
  }
  async #drawAll() {
    const rows = await crs.call("data_manager", "get_all", { manager: this.dataset.manager });
    const instances = await crs.binding.inflation.manager.get(this.dataset.template, rows);
    await this.#addInstancesToUI(instances);
  }
  async #refresh(args) {
    if (this.#columns.length == 0)
      return;
    await this.#clear();
    await this.#drawAll();
  }
  async #add(args) {
    const instances = await crs.binding.inflation.manager.get(this.dataset.template, args.models);
    await this.#addInstancesToUI(instances);
  }
  async #delete(args) {
    const elements = [];
    for (let id of args.ids) {
      const element = this.container.querySelector(`[data-id="${id}"]`);
      if (element != null) {
        elements.push(element);
      }
    }
    for (let element of elements) {
      element.parentElement.removeChild(element);
    }
  }
  async #update(args) {
    const element = this.container.querySelector(`[data-id="${args.id}"]`);
    const row = await crs.call("data_manager", "get", { manager: this.dataset.manager, id: args.id });
    await crs.binding.inflation.manager.get(this.dataset.template, [row], [element]);
  }
  async refresh(args) {
    const action = args?.action || "refresh";
    switch (action) {
      case "refresh": {
        await this.#refresh(args);
        break;
      }
      case "add": {
        await this.#add(args);
        break;
      }
      case "delete": {
        await this.#delete(args);
        break;
      }
      case "update": {
        await this.#update(args);
        break;
      }
    }
  }
  async observe_changes() {
    await crs.call("data_manager", "on_change", {
      manager: this.dataset.manager,
      callback: this.#refreshHandler
    });
  }
  async unobserve_changes() {
    await crs.call("data_manager", "remove_change", {
      manager: this.dataset.manager,
      callback: this.#refreshHandler
    });
  }
  async #enableDragDrop() {
    await crs.call("dom_interactive", "enable_dragdrop", {
      element: this,
      options: {
        drag: {
          placeholderType: "standard"
        },
        drop: {
          allowDrop: "[role='cell']",
          allowCallback: this.#allowDropHandler,
          callback: this.#onDropHandler
        },
        autoScroll: "hv"
      }
    });
  }
  async #disableDragDrop() {
    await crs.call("dom_interactive", "disable_dragdrop", { element: this });
  }
  async #allowDrop(dragElement, target) {
    if (this.dataset.allowDrop == null)
      return true;
    const parts = getProcessParts(this.dataset.allowDrop);
    const model = await crs.call("data_manager", "get", {
      manager: this.dataset.manager,
      id: dragElement.dataset.id
    });
    const item = { dragElement, target, model };
    await crs.call("process", parts[1], {
      schema: parts[0]
    }, null, null, item);
    const result = item.result;
    item.dragElement = null;
    item.target = null;
    item.model = null;
    return result;
  }
  async #onDrop(dragElement, target) {
    const parts = getProcessParts(this.dataset.onDrop);
    const model = await crs.call("data_manager", "get", {
      manager: this.dataset.manager,
      id: dragElement.dataset.id
    });
    const item = { dragElement, target, model };
    await crs.call("process", parts[1], {
      schema: parts[0]
    }, null, null, item);
    item.dragElement = null;
    item.target = null;
    item.model = null;
  }
}
function getProcessParts(exp) {
  return exp.replace("()]", "").split("[");
}
await crs.modules.add("kan_ban", import.meta.url);
customElements.define("kan-ban", KanBan);
export {
  KanBan as default
};
