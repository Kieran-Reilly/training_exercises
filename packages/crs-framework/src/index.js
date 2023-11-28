crs.modules.api = async (key, url) => await crs.modules.add(key, url.replace(".js", "-actions.js"));
