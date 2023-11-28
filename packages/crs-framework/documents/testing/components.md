# Testing components

## Introduction
Testing is done using Deno tests.  
There are a number of requirements to get testing to work properly.  
The first, use BDD testing as we need the before and after functions.

## Initialize
You need to ensure that all the relevant crs libraries are loaded before you can start your testing.  
This is done by using the `initRequired` function found in `test/mockups/init-required.js`.  
This creates basic dom global objects you may need and also loads the libraries.

## Basic test file structure

```js
import {initRequired} from "...path to.../mockups/init-required.js";
import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {ElementMock} from "...path to.../mockups/element.mock.js";


beforeAll(async () => {
    // load your component and resources here
    await import("...path to.../components/my-component/my-component.js");
})

afterAll(async () => {
    // perform cleanup if required
})

describe("test suit name", () => {
    beforeEach(async () => {
        // create a instance of your component
        instance = document.createElement("my-component");
        
        // create ref elements if you used ref in the binding engine
        instance.header = new ElementMock("div");

        // call connectedCallback
        await instance.connectedCallback();
    })
    
    afterEach(async () => {
        // dispose of your component
        instance = await instance.disconnectedCallback();
    })
    
    init("unique test name", async () => {
        // perform test
    })
})
```

## Creating mock children from html

When testing your component, you may want to interact with children using query selectors, setting attributes or data- attributes.    
Basically mocking out the dom where each element is a mock element.  
You can call createMockChildren passing on the component mock element as a parameter.  
Note that you should have called connectedCallback before calling this or manually setting the innerHTML property on the instance.

`createMockChildren(instance);`

## querySelector

If you have created mock children (see above) you can use `querySelector` and `querySelectorAll`.  
If your component uses query selector during the connected callback, you have a timing issue since the child mocks are not in place yet.

You can overcome that and complex queries by setting a key value pair on the `queryResults` property of the instance.  
Consider the below.  

```js
beforeEach(async () => {
    instance = document.createElement("label-counter");
    
    // required for the connected callback to function
    instance.dataset.label = "Test Label";
    instance.queryResults["[data-id='label']"] = new ElementMock();

    await instance.connectedCallback();
    createMockChildren(instance);
})
```

You can access the queryResults also when asserting values.

```js
assertEquals(instance.queryResults["[data-id='label']"].textContent, "Test Label");
```

Items created by the createMockChildren function can be accessed using standard querySelector syntax.

```js
const btnIncrease = instance.querySelector('[data-id="increase"]');
```