import { ModelProxyHandler } from "./model-proxy.js";
class RecordManagerActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  /**
   * @function register - Registers a record definition with the record manager.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   *
   * @example <caption>Javascript</caption>
   * await crs.call("record_manager", "register", {
   *     manager: "my_manager",
   *     data: {... definition ...}
   * })
   *
   * @example <caption>JSON</caption>
   * {
   *     "type": "record_manager",
   *     "action": "register",
   *     "args": {
   *         "manager": "my_manager",
   *         "data": {... definition ...}
   *     }
   * }
   */
  static async register(step, context, process, item) {
    if (globalThis.recordDefinitions == null) {
      globalThis.recordDefinitions = {};
    }
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    const data = await crs.process.getValue(step.args.data, context, process, item);
    compileConditionalExp(data);
    globalThis.recordDefinitions[manager] = data;
  }
  /**
   * @function unregister - Unregisters a record definition with the record manager.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async unregister(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    delete globalThis.recordDefinitions[manager];
  }
  /**
   * @function set_default - Sets a default for a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async set_default(step, context, process, item) {
  }
  /**
   * @function remove_default - Removes a default from a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async remove_default(step, context, process, item) {
  }
  /**
   * @function set_conditional_default - Sets a conditional default for a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async set_conditional_default(step, context, process, item) {
  }
  /**
   * @function remove_conditional_default - Removes a conditional default from a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async remove_conditional_default(step, context, process, item) {
  }
  /**
   * @function set_validation - Sets a validation for a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async set_validation(step, context, process, item) {
  }
  /**
   * @function remove_validation - Removes a validation from a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async remove_validation(step, context, process, item) {
  }
  /**
   * @function set_conditional_validation - Sets a conditional validation for a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async set_conditional_validation(step, context, process, item) {
  }
  /**
   * @function remove_conditional_validation - Removes a conditional validation from a record definition.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async remove_conditional_validation(step, context, process, item) {
  }
  /**
   * @function register_callback - Registers a callback function for a given record
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async register_callback(step, context, process, item) {
  }
  /**
   * @function unregister_callback - Unregisters a callback function for a given record
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async unregister_callback(step, context, process, item) {
  }
  /**
   * @function callback - Calls a callback function for a given record
   * This is used for example to do remote actions for a record such as loading, saving and updating the database
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async callback(step, context, process, item) {
  }
  /**
   * @function validate - Validates a record against the record manager.
   * customDefaultValidations are always validated
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<void>}
   */
  static async validate(step, context, process, item) {
  }
  /**
   * @function create - Creates a new record to work with.
   * @param step
   * @param context
   * @param process
   * @param item
   * @returns {Promise<>}
   */
  static async create(step, context, process, item) {
    const manager = await crs.process.getValue(step.args.manager, context, process, item);
    const data = createModel(manager);
    return new Proxy(data, ModelProxyHandler);
  }
}
function createModel(manager) {
  const definition = globalThis.recordDefinitions[manager];
  if (definition == null)
    return {};
  const model = {
    $manager: manager
  };
  for (const field of definition.fields) {
    const fieldName = field.name || field.field;
    model[fieldName] = field.default || null;
  }
  return model;
}
async function compileConditionalExp(definition) {
  for (const field of definition.fields) {
    if (field.conditionalDefaults != null) {
      const conditionalDefaultsMap = definition["conditionalDefaultsMap"] ||= {};
      for (const rule of field.conditionalDefaults) {
        const expr = await crs.binding.expression.sanitize(rule.conditionExpr, "model");
        const properties = expr.properties;
        for (const property of properties) {
          const fieldName = field["field"] || field["name"];
          conditionalDefaultsMap[property] ||= [];
          conditionalDefaultsMap[property].push(fieldName);
        }
        rule.conditionExpr = new Function("model", `return ${expr.expression}`);
      }
    }
  }
}
crs.intent.record_manager = RecordManagerActions;
