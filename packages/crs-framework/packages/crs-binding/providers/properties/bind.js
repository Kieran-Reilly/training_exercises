import"../../expressions/code-factories/if.js";import{bindingUpdate as r}from"./utils/binding-update.js";import{bindingParse as t}from"./utils/binding-parse.js";class c{async onEvent(e,n,d,i){const o=i.dataset.field;if(n==null||o==null)return;let a=i.value;i.nodeName==="INPUT"&&(i.type==="checkbox"&&(a=i.checked),i.type==="number"&&(a=Number(a))),await crs.binding.data.setProperty(n,o,a)}async parse(e,n){const d=e.name.indexOf("two-way")!=-1?".two-way":".bind";await t(e,n,d)}async update(e,...n){await r(e,...n)}async clear(e){crs.binding.eventStore.clear(e)}}export{c as default};
