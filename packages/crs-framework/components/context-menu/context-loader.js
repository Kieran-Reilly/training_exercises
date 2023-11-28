const isMobile = await crs.call("system", "is_mobile", {});
const url = isMobile ? "./context-menu-full.js" : "./context-menu.js";
await import(new URL(url, import.meta.url));
