async function l(n,s,t){const c=t?.ctxName||"context",e=`${c}:${n}`;if(crs.binding.functions.has(e)){const u=crs.binding.functions.get(e);return u.count+=1,u}s=s||[];const f=t?.sanitize??!0;let i,o=n;f==!0?(i=await crs.binding.expression.sanitize(n,c),o=i.isLiteral===!0?["return `",i.expression,"`"].join(""):["return ",i.expression].join("")):i={expression:n};const r={key:e,function:new crs.classes.AsyncFunction(c,...s,o),parameters:i,count:1};return crs.binding.functions.set(e,r),r}function a(n){if(n==null||typeof n!="object")return;const s=n.key;if(crs.binding.functions.has(s)){const t=crs.binding.functions.get(s);t.count-=1,t.count==0&&(crs.binding.utils.disposeProperties(t),crs.binding.functions.delete(s))}}export{l as compile,a as release};