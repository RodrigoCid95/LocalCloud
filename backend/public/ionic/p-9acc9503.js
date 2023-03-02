import{i as o,w as s}from"./p-c36f36fa.js";import{a as t,s as r}from"./p-2965f26f.js";import{c as a}from"./p-f08587bc.js";import"./p-28e84784.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const f=()=>{const f=window;f.addEventListener("statusTap",(()=>{o((()=>{const o=f.innerWidth;const n=f.innerHeight;const c=document.elementFromPoint(o/2,n/2);if(!c){return}const i=t(c);if(i){new Promise((o=>a(i,o))).then((()=>{s((async()=>{i.style.setProperty("--overflow","hidden");await r(i,300);i.style.removeProperty("--overflow")}))}))}}))}))};export{f as startStatusTap};
//# sourceMappingURL=p-9acc9503.js.map