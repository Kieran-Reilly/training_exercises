async function handleSelection(event, options, component, filterHeader) {
  const li = await crs.call("dom_utils", "find_parent_of_type", {
    element: event.composedPath()[0],
    nodeName: "li",
    stopAtNodeName: "ul"
  });
  if (li == null)
    return;
  if (li.matches(".parent-menu-item")) {
    filterHeader.clear();
    const isExpanded = li.getAttribute("aria-expanded") === "true";
    return li.setAttribute("aria-expanded", !isExpanded);
  }
  const option = findInStructure(options, li.id);
  if (option.type != null) {
    crs.call(option.type, option.action, option.args);
  }
  component.dataset.value = option.id;
  component.dispatchEvent(new CustomEvent("change", { detail: option.id }));
  await crs.call("context_menu", "close");
}
function findInStructure(collection, id) {
  for (const item of collection) {
    if (item.id == id)
      return item;
    if (item.children != null) {
      const childItem = findInStructure(item.children, id);
      if (childItem != null) {
        return childItem;
      }
    }
  }
}
export {
  handleSelection
};
