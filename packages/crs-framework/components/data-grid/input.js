import { markSelected, markAllSelected } from "./selection.js";
async function enableInput(grid) {
  grid._clickHandler = click.bind(grid);
  grid.addEventListener("click", grid._clickHandler);
}
async function disableInput(grid) {
  grid.removeEventListener("click", grid._clickHandler);
  grid._clickHandler = null;
}
async function click(event) {
  event.preventDefault();
  const target = event.composedPath()[0];
  if (target.dataset.field == "_selected") {
    return await markSelected(this, target);
  }
  if (target.classList.contains("selection")) {
    const checked = target.textContent == "check";
    await markAllSelected(this, !checked);
    return target.textContent = checked ? "uncheck" : "check";
  }
}
export {
  disableInput,
  enableInput
};
