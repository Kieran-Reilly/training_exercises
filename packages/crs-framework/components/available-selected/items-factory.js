class ItemsFactory {
  /**
   * @method #base - This method will create the base element for the template to inflate.
   * The element type is an Li element.
   * @param templateToInflate {HTMLTemplateElement} - The element to use as parent.
   * @param collection {String} - The collection to create the element for.
   * @param idFieldText {String} - The id field text to use.
   * @returns {Promise<*>}
   */
  static async #base(templateToInflate, collection, idFieldText) {
    return await this.createElement("li", templateToInflate, {
      classes: [collection],
      dataset: { id: idFieldText }
    });
  }
  /**
   * @method #button - This method will create a button element.
   * @param parent {HTMLElement} - The element to use as parent.
   * @param action {String} - The action to use.
   * @param text_content {String} - The text content to use as button text.
   * @returns {Promise<void>}
   */
  static async #button(parent, action, text_content) {
    await this.createElement("button", parent, {
      classes: ["icon"],
      dataset: { action },
      text_content
    });
  }
  /**
   * @method #label - This method will create a label element.
   * @param parent {HTMLElement} - The element to use as parent.
   * @param idFieldText {String} - The id field text to use.
   * @returns {Promise<*>}
   */
  static async #label(parent, idFieldText) {
    return await this.createElement("label", parent, {
      text_content: idFieldText
    });
  }
  /**
   * @method #buildInflationTemplate - This method will create the template for the available and selected items.
   * @param element {HTMLElement} - The element to use as parent.
   * @param collection {String} - The collection to create the element for.
   * @returns {Promise<HTMLTemplateElement>}
   */
  static async #buildInflationTemplate(element, collection) {
    const templateToInflate = document.createElement("template");
    const idFieldText = ["${", element.dataset.idField || "id", "}"].join("");
    const li = await this.#base(templateToInflate, collection, idFieldText);
    const label = await this.#label(null, idFieldText);
    if (element.dataset.drag === "true" && collection === "selected") {
      await this.#button(li, "drag", "drag-hori");
      label.dataset.action = "drag";
    }
    li.appendChild(label);
    if (element.dataset.drillDown === "true" && collection === "selected") {
      await this.#button(li, "drill", "chevron-right");
      label.dataset.action = "drill";
    }
    const toggleText = collection === "available" ? "add-circle-outline" : "minus-circle-outline";
    await this.#button(li, "toggle", toggleText);
    return templateToInflate;
  }
  /**
   * @method #inflate - This method will inflate the template with the data.
   * @param templateToInflate {HTMLTemplateElement} - The element to use as parent.
   * @param data {Object} - The data to use.
   * @param collection {String} - The collection to create the element for.
   * @returns {Promise<HTMLTemplateElement>}
   */
  static async #inflate(templateToInflate, data, collection) {
    const template = document.createElement("template");
    const ul = document.createElement("ul");
    for (const item of data[collection]) {
      const inflatedTemplateContent = await crs.call("html", "create", { html: templateToInflate.innerHTML, ctx: item });
      await ul.appendChild(inflatedTemplateContent);
    }
    template.content.appendChild(ul);
    return template;
  }
  /**
   * @method createElement - This method will create an element.
   * @param tagName {String} - The element to create.
   * @param parent {HTMLElement} - The element to use as parent.
   * @param options {Object} - The options to use.
   * @returns {Promise<*>}
   */
  static async createElement(tagName, parent, options) {
    return await crs.call("dom", "create_element", {
      parent,
      tag_name: tagName,
      classes: options.classes || [],
      dataset: options.dataset || {},
      attributes: options.attributes || {},
      text_content: options.text_content || null
    });
  }
  /**
   * @method createTemplate - This method will create the template for the available and selected items.
   * @param element
   * @param currentView
   * @param collection
   * @param data
   * @returns {Promise<HTMLTemplateElement>}
   */
  static async createTemplate(element, currentView, collection, data) {
    const templateToInflate = await this.#buildInflationTemplate(element, collection);
    const resultTemplate = await this.#inflate(templateToInflate, data, collection);
    resultTemplate.dataset.id = collection;
    if (currentView == collection)
      resultTemplate.dataset.default = "true";
    return resultTemplate;
  }
}
export {
  ItemsFactory
};
