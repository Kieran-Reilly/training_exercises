async function schemaTemplate(element, context, options) {
  const folder = options?.folder || "/";
  const file = crs.binding.utils.relativePathFrom(folder, element.getAttribute("schema"));
  const id = element.dataset.parser || "html";
  const schema = await fetch(file).then((result) => result.json());
  const html = await crs.call("schema", "parse", { id, schema });
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const instance = tpl.content.cloneNode(true);
  await crs.binding.parsers.parseElements(instance.children, context, options);
  const parent = element.parentElement || element.getRootNode();
  parent.insertBefore(instance, element);
  parent.removeChild(element);
}
crs.binding.templateProviders.add("schema", schemaTemplate);
