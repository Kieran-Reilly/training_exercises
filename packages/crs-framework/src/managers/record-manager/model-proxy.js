const ModelProxyHandler = {
  get: function(target, prop) {
    return target[prop];
  },
  set: function(receiver, property, value, proxy) {
    receiver[property] = value;
    setConditionalDefaults(proxy, property);
    return true;
  }
};
function setConditionalDefaults(proxy, property) {
  const definition = globalThis.recordDefinitions[proxy.$manager];
  if (definition == null)
    return;
  const updateFields = definition.conditionalDefaultsMap[property];
  if (updateFields == null)
    return;
  for (const updateField of updateFields) {
    const fieldDef = definition.fields.find((f) => f.field === updateField || f.name === updateField);
    if (fieldDef.conditionalDefaults == null)
      continue;
    for (const rule of fieldDef.conditionalDefaults) {
      if (rule.conditionExpr(proxy)) {
        proxy[updateField] = rule.value;
      }
    }
  }
}
export {
  ModelProxyHandler
};
