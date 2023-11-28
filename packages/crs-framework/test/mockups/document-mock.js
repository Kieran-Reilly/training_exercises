import {ElementMock, mockElement} from "./element-mock.js"
import {createMockChildren} from "./child-mock-factory.js";

globalThis.document = new ElementMock("document");
globalThis.document.body = new ElementMock("body");
globalThis.document.documentElement = globalThis.document.body;

globalThis.document.appendChild = globalThis.document.body.appendChild;

globalThis.document.createElement = (tag, html) => {
    if (globalThis.__elementRegistry[tag] != null) {
        let result = mockElement(new globalThis.__elementRegistry[tag](), tag);

        if (result.load != null) {
            const load = result.load;
            result.load = async () => {
                createMockChildren(result);
                await load.call(result);
            }
        }

        return result;
    }

    return new ElementMock(tag);
}

globalThis.document.querySelector = (selector) => {
    return globalThis.document.body.querySelector(selector);
}

globalThis.document.createTextNode = () => {
    return new ElementMock("text");
}

globalThis.document.createDocumentFragment = () => {
    return new ElementMock("DOCUMENT-FRAGMENT");
}
