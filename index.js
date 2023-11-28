// import "/src/pwa.js";
import "/src/theme.js";
import "/packages/crs-framework/packages/crs-binding/crs-binding.js";
import "/packages/crs-framework/packages/crs-binding/events/event-emitter.js";
import "/packages/crs-framework/packages/crs-binding/expressions/code-factories/if.js";
import "/packages/crs-framework/packages/crs-binding/classes/bindable-element.js";
import "/packages/crs-framework/packages/crs-modules/crs-modules.js";
import {initialize} from "/packages/crs-framework/packages/crs-process-api/crs-process-api.js";
import "/packages/crs-framework/packages/crs-process-api/components/view-loader/view-loader.js";

class IndexViewModel {
    #bid;

    get bid() {
        return this.#bid;
    }

    constructor() {
        this.#bid = crs.binding.data.addObject(this.constructor.name);
        crs.binding.data.addContext(this.#bid, this);
        crs.binding.parsers.parseElements(document.body.children, this).catch(errors => console.error(errors));
    }
}

await initialize("/packages/crs-framework/packages/crs-process-api/");
globalThis.indexViewModel = new IndexViewModel();