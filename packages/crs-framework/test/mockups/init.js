/**
 * Initialize the mocking objects for testing purposes
 */
import * as path from "https://deno.land/std/path/mod.ts";
import {exists} from "https://deno.land/std/fs/mod.ts"
import {ElementMock} from "./element-mock.js"
import "./custom-elements.js";
import "./document-mock.js";
import "./computed-style.js";
import "./screen.js";

export async function init() {
    const packages = await getPackagesFolder()

    globalThis.DocumentFragment = ElementMock;
    globalThis.HTMLElement = ElementMock;
    globalThis.Element = ElementMock;
    globalThis.HTMLInputElement = ElementMock;
    globalThis.requestAnimationFrame = (callback) => callback();

    const crs_binding_root = path.join(packages, "crs-binding");
    const crs_binding = path.join(packages, "crs-binding/crs-binding.js");
    const crs_modules = path.join(packages, "crs-modules/crs-modules.js");
    const crs_process = path.join(packages, "crs-process-api/crs-process-api.js");

    await import(crs_binding);
    await import(`${crs_binding_root}/events/event-emitter.js`);
    await import(`${crs_binding_root}/expressions/code-factories/if.js`);
    await import(`${crs_binding_root}/expressions/code-factories/case.js`);
    await import(`${crs_binding_root}/classes/bindable-element.js`);
    await import(`${crs_binding_root}/classes/perspective-element.js`);
    await import(`${crs_binding_root}/managers/value-converters-manager.js`);
    await import(crs_modules);

    const processModule = await import(crs_process);
    await processModule.initialize(`${packages}/crs-process-api`);
}

async function getPackagesFolder() {
    const dirname = path.dirname(path.fromFileUrl(import.meta.url));

    let dir = path.join(dirname, "./../../packages");
    if (! await exists(dir)) {
        dir = path.join(dirname, "./../..");
    }

    return path.join("file://", dir);
}

await init();