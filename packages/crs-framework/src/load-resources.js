async function loadHTML(path, withCSS = true) {
  let html = await fetch(path.replace(".js", ".html")).then((response) => response.text());
  if (withCSS) {
    const link = `<link rel="stylesheet" href="${path.replace(".js", ".css")}">`;
    html = `${link}${html}`;
  }
  return html;
}
export {
  loadHTML
};
