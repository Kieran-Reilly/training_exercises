async function formattingFromChildren(table) {
  const formatterElements = table.querySelectorAll("formatter");
  if (formatterElements.length === 0)
    return;
  const formatSettings = {
    rows: [],
    columns: {}
  };
  for (let formatterElement of formatterElements) {
    const condition = formatterElement.dataset.condition ?? null;
    const classes = (formatterElement.dataset.classes ?? "").split(" ");
    const styles = formatterElement.dataset.styles ?? "";
    const formatter = {
      condition,
      classes,
      styles
    };
    if (formatterElement.parentElement.dataset.property == null) {
      formatSettings.rows.push(formatter);
      continue;
    }
    const property = formatterElement.parentElement.dataset.property;
    const propertyCollection = formatSettings.columns[property] ||= [];
    propertyCollection.push(formatter);
  }
  await crs.call("data_table", "set_formatter", {
    element: table,
    settings: formatSettings
  });
}
export {
  formattingFromChildren
};
