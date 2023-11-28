import { DataManagerMemoryProvider } from "./data-manager-memory-provider.js";
import { DataManagerIDBProvider } from "./data-manager-idb-provider.js";
import { DataManagerPerspectiveProvider } from "./data-manager-perspective-provider.js";
const MANAGER_TYPES = Object.freeze({
  memory: DataManagerMemoryProvider,
  idb: DataManagerIDBProvider,
  perspective: DataManagerPerspectiveProvider
});
const CHANGE_TYPES = Object.freeze({
  add: "add",
  update: "update",
  delete: "delete",
  refresh: "refresh",
  selected: "selected",
  perspectiveChanged: "perspective_changed",
  perspectiveRollback: "perspective_rollback"
});
export {
  CHANGE_TYPES,
  MANAGER_TYPES
};
