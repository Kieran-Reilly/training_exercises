async function markdownTemplate(element, context, options) {
  const folder = options?.folder || "/";
  const file = crs.binding.utils.relativePathFrom(folder, element.getAttribute("markdown"));
  const md = await fetch(file).then((result) => result.text());
  const html = await crs.call("markdown", "to_html", { markdown: md });
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const instance = tpl.content.cloneNode(true);
  await crs.binding.parsers.parseElements(instance.children, context, options);
  const parent = element.parentElement || element.getRootNode();
  parent.insertBefore(instance, element);
  parent.removeChild(element);
}
crs.binding.templateProviders.add("markdown", markdownTemplate);
