/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const t=t=>{try{if(t instanceof c){return t.value}if(!o()||typeof t!=="string"||t===""){return t}if(t.includes("onload=")){return""}const s=document.createDocumentFragment();const i=document.createElement("div");s.appendChild(i);i.innerHTML=t;r.forEach((t=>{const o=s.querySelectorAll(t);for(let t=o.length-1;t>=0;t--){const r=o[t];if(r.parentNode){r.parentNode.removeChild(r)}else{s.removeChild(r)}const c=e(r);for(let t=0;t<c.length;t++){n(c[t])}}}));const l=e(s);for(let t=0;t<l.length;t++){n(l[t])}const u=document.createElement("div");u.appendChild(s);const d=u.querySelector("div");return d!==null?d.innerHTML:u.innerHTML}catch(t){console.error(t);return""}};const n=t=>{if(t.nodeType&&t.nodeType!==1){return}if(typeof NamedNodeMap!=="undefined"&&!(t.attributes instanceof NamedNodeMap)){t.remove();return}for(let n=t.attributes.length-1;n>=0;n--){const e=t.attributes.item(n);const o=e.name;if(!s.includes(o.toLowerCase())){t.removeAttribute(o);continue}const r=e.value;const c=t[o];if(r!=null&&r.toLowerCase().includes("javascript:")||c!=null&&c.toLowerCase().includes("javascript:")){t.removeAttribute(o)}}const o=e(t);for(let t=0;t<o.length;t++){n(o[t])}};const e=t=>t.children!=null?t.children:t.childNodes;const o=()=>{var t;const n=window;const e=(t=n===null||n===void 0?void 0:n.Ionic)===null||t===void 0?void 0:t.config;if(e){if(e.get){return e.get("sanitizerEnabled",true)}else{return e.sanitizerEnabled===true||e.sanitizerEnabled===undefined}}return true};const s=["class","id","href","src","name","slot"];const r=["script","style","iframe","meta","link","object","embed"];class c{constructor(t){this.value=t}}export{t as s};
//# sourceMappingURL=p-3773f7d4.js.map