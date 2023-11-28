function u(e,a){if(e.indexOf("[")!=-1){const t=e.lastIndexOf("]"),l=e.substring(1,t);a.queries=l.split(","),a.value!=null&&(a.value=e.replace(`[${l}].`,""))}}export{u as getQueries};
