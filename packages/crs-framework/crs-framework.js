export async function init(options) {
    await import ("./packages/crs-binding/crs-binding.js");
    await import ("./packages/crs-modules/crs-modules.js");

    const processModule = await import("./packages/crs-process-api/crs-process-api.js");
    await processModule.initialize("/packages/crs-framework/packages/crs-process-api");

    if (options.router == true) {
        await import("./packages/crs-router/crs-router.js");
    }

    globalThis.loaded = true;
}