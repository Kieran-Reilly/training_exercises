class FileSystem extends crs.classes.BindableElement {
  #data = [];
  get shadowDom() {
    return true;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  async connectedCallback() {
    await super.connectedCallback();
  }
  async load() {
    const tplFolder = this.shadowRoot.querySelector("#tplFolder");
    const tplFile = this.shadowRoot.querySelector("#tplFile");
    await crs.binding.inflation.manager.register("file-system-folder", tplFolder);
    await crs.binding.inflation.manager.register("file-system-file", tplFile);
  }
  async disconnectedCallback() {
    await crs.binding.inflation.manager.unregister("file-system-folder");
    await crs.binding.inflation.manager.unregister("file-system-file");
    await super.disconnectedCallback();
  }
  #setPath(array, root) {
    for (const item of array) {
      item.path = root.length == 0 ? item.name : `${root}/${item.name}`;
    }
  }
  async #expandFolder(element) {
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: {
        kind: "directory",
        name: element.textContent.split("\n").join("")
      }
    }));
    if (element.matches('[aria-expanded="true"]')) {
      return await this.#collapseFolder(element);
    }
    element.setAttribute("aria-expanded", "true");
    const level = Number(element.dataset.level);
    const path = element.dataset.path;
    const index = this.#data.findIndex((item) => item.path == path);
    const handle = this.#data[index];
    const data = await crs.call("fs", "open_folder", { handle });
    await this.#prefixPaths(data, path);
    const fragment = await this.#generateFragment(data, level + 1);
    const parentElement = element.parentElement || element.getRootNode();
    parentElement.insertBefore(fragment, element.nextElementSibling);
    this.#data.splice(index + 1, 0, ...data);
    element.dataset.count = data.length;
  }
  async #collapseFolder(element) {
    element.setAttribute("aria-expanded", "false");
    const count = Number(element.dataset.count);
    element.dataset.count = 0;
    const parentElement = element.parentElement || element.getRootNode();
    for (let i = 0; i < count; i++) {
      parentElement.removeChild(element.nextElementSibling);
    }
    const index = this.#data.findIndex((item) => item.path == element.dataset.path);
    this.#data.splice(index + 1, count);
  }
  async #loadFile(element) {
    const path = element.dataset.path;
    const handle = this.#data.find((item) => item.path == path);
    const result = await crs.call("fs", "read_file", { handle });
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: {
        kind: "file",
        name: element.textContent.split("\n").join(""),
        content: result,
        path: element.dataset.path
      }
    }));
  }
  async #prefixPaths(data, path) {
    for (const item of data) {
      item.path = `${path}/${item.name}`;
    }
  }
  async #generateFragment(data, level = 0) {
    const folders = [];
    const files = [];
    for (const item of data) {
      if (item.kind == "file") {
        files.push(item);
      } else {
        folders.push(item);
      }
    }
    sortArray(folders);
    sortArray(files);
    const fragment = document.createDocumentFragment();
    await buildUI(folders, fragment, "file-system-folder", level);
    await buildUI(files, fragment, "file-system-file", level);
    return fragment;
  }
  /**
   * called externally to start the process when the parent is ready
   * @returns {Promise<void>}
   */
  async selectFolder() {
    this.#data = await crs.call("fs", "open_folder", {});
    this.#setPath(this.#data, "");
    const ul = this.shadowRoot.querySelector("ul");
    ul.innerHTML = "";
    const children = await this.#generateFragment(this.#data);
    await ul.appendChild(children);
  }
  /**
   * called by binding
   */
  async dblclick(event) {
    const element = event.composedPath()[0];
    if (element.nodeName == "UL")
      return;
    const parentElement = element.parentElement || element.getRootNode();
    const selected = parentElement.querySelector("[aria-selected]");
    selected?.removeAttribute("aria-selected");
    element.setAttribute("aria-selected", "true");
    if (element.dataset.type === "directory") {
      return await this.#expandFolder(element);
    }
    await this.#loadFile(element);
  }
  async click(event) {
    const element = event.composedPath()[0];
    const parentElement = element.parentElement || element.getRootNode();
    const selected = parentElement.querySelector("[aria-selected]");
    selected?.removeAttribute("aria-selected");
    element.setAttribute("aria-selected", "true");
    if (element.dataset.type === "file") {
      await this.#loadFile(element);
    }
  }
  async save(key, content) {
    const handle = this.#data?.find((item) => item.path == key);
    if (handle == null)
      return;
    await crs.call("fs", "save_file", { handle, content });
    await crs.call("toast_notification", "show", { message: "successfully saved", severity: "info" });
  }
  async saveNew(content, fileTypes) {
    const handle = await crs.call("fs", "write_new_file", {
      file_types: fileTypes,
      default_name: "undefined",
      content
    });
    handle.path = handle.name;
    this.#data.push(handle);
    return handle.name;
  }
}
function sortArray(array) {
  array.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
}
async function buildUI(array, fragment, key, level) {
  if (array.length == 0)
    return;
  const items = await crs.binding.inflation.manager.get(key, array);
  while (items?.firstElementChild) {
    const element = items.firstElementChild.cloneNode(true);
    element.dataset.level = level;
    element.style.marginLeft = `${level * 16}px`;
    fragment.appendChild(element);
    items.removeChild(items.firstElementChild);
  }
}
customElements.define("file-system", FileSystem);
export {
  FileSystem as default
};
