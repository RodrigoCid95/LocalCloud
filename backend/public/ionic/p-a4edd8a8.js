import{g as t,c as o,a as n}from"./p-2965f26f.js";import{a as s,r as e,b as c,p as r,c as i}from"./p-f08587bc.js";import"./p-28e84784.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const a=new WeakMap;const u=(t,o,n,s=0,e=false)=>{if(a.has(t)===n){return}if(n){l(t,o,s,e)}else{d(t,o)}};const f=t=>t===t.getRootNode().activeElement;const l=(t,o,n,s=false)=>{const e=o.parentNode;const c=o.cloneNode(false);c.classList.add("cloned-input");c.tabIndex=-1;if(s){c.disabled=true}e.appendChild(c);a.set(t,c);const r=t.ownerDocument;const i=r.dir==="rtl"?9999:-9999;t.style.pointerEvents="none";o.style.transform=`translate3d(${i}px,${n}px,0) scale(0)`};const d=(t,o)=>{const n=a.get(t);if(n){a.delete(t);n.remove()}t.style.pointerEvents="";o.style.transform=""};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const w=(t,o,n)=>{if(!n||!o){return()=>{}}const c=n=>{if(f(o)){u(t,o,n)}};const r=()=>u(t,o,false);const i=()=>c(true);const a=()=>c(false);s(n,"ionScrollStart",i);s(n,"ionScrollEnd",a);o.addEventListener("blur",r);return()=>{e(n,"ionScrollStart",i);e(n,"ionScrollEnd",a);o.removeEventListener("blur",r)}};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const p="input, textarea, [no-blur], [contenteditable]";const h=()=>{let t=true;let o=false;const n=document;const c=()=>{o=true};const r=()=>{t=true};const i=s=>{if(o){o=false;return}const e=n.activeElement;if(!e){return}if(e.matches(p)){return}const c=s.target;if(c===e){return}if(c.matches(p)||c.closest(p)){return}t=false;setTimeout((()=>{if(!t){e.blur()}}),50)};s(n,"ionScrollStart",c);n.addEventListener("focusin",r,true);n.addEventListener("touchend",i,false);return()=>{e(n,"ionScrollStart",c,true);n.removeEventListener("focusin",r,true);n.removeEventListener("touchend",i,false)}};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const m=.3;const S=(t,o,n)=>{var s;const e=(s=t.closest("ion-item,[ion-item]"))!==null&&s!==void 0?s:t;return b(e.getBoundingClientRect(),o.getBoundingClientRect(),n,t.ownerDocument.defaultView.innerHeight)};const b=(t,o,n,s)=>{const e=t.top;const c=t.bottom;const r=o.top;const i=Math.min(o.bottom,s-n);const a=r+15;const u=i*.75;const f=u-c;const l=a-e;const d=Math.round(f<0?-f:l>0?-l:0);const w=Math.min(d,e-r);const p=Math.abs(w);const h=p/m;const S=Math.min(400,Math.max(150,h));return{scrollAmount:w,scrollDuration:S,scrollPadding:n,inputSafeY:-(e-a)+4}};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const y=(t,o,n,s,e,c=false)=>{let i;const a=t=>{i=r(t)};const u=a=>{if(!i){return}const u=r(a);if(!D(6,i,u)&&!f(o)){M(t,o,n,s,e,c)}};t.addEventListener("touchstart",a,{capture:true,passive:true});t.addEventListener("touchend",u,true);return()=>{t.removeEventListener("touchstart",a,true);t.removeEventListener("touchend",u,true)}};const M=async(n,s,e,r,i,a=false)=>{if(!e&&!r){return}const f=S(n,e||r,i);if(e&&Math.abs(f.scrollAmount)<4){s.focus();return}u(n,s,true,f.inputSafeY,a);s.focus();c((()=>n.click()));if(typeof window!=="undefined"){let c;const r=async()=>{if(c!==undefined){clearTimeout(c)}window.removeEventListener("ionKeyboardDidShow",i);window.removeEventListener("ionKeyboardDidShow",r);if(e){await o(e,0,f.scrollAmount,f.scrollDuration)}u(n,s,false,f.inputSafeY);s.focus()};const i=()=>{window.removeEventListener("ionKeyboardDidShow",i);window.addEventListener("ionKeyboardDidShow",r)};if(e){const o=await t(e);const n=o.scrollHeight-o.clientHeight;if(f.scrollAmount>n-o.scrollTop){if(s.type==="password"){f.scrollAmount+=50;window.addEventListener("ionKeyboardDidShow",i)}else{window.addEventListener("ionKeyboardDidShow",r)}c=setTimeout(r,1e3);return}}r()}};const D=(t,o,n)=>{if(o&&n){const s=o.x-n.x;const e=o.y-n.y;const c=s*s+e*e;return c>t*t}return false};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const v="$ionPaddingTimer";const x=t=>{const o=document;const n=o=>{T(o.target,t)};const s=t=>{T(t.target,0)};o.addEventListener("focusin",n);o.addEventListener("focusout",s);return()=>{o.removeEventListener("focusin",n);o.removeEventListener("focusout",s)}};const T=(t,o)=>{var s,e;if(t.tagName!=="INPUT"){return}if(t.parentElement&&t.parentElement.tagName==="ION-INPUT"){return}if(((e=(s=t.parentElement)===null||s===void 0?void 0:s.parentElement)===null||e===void 0?void 0:e.tagName)==="ION-SEARCHBAR"){return}const c=n(t);if(c===null){return}const r=c[v];if(r){clearTimeout(r)}if(o>0){c.style.setProperty("--keyboard-offset",`${o}px`)}else{c[v]=setTimeout((()=>{c.style.setProperty("--keyboard-offset","0px")}),120)}};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const g=true;const k=true;const I=(t,o)=>{const s=document;const e=o==="ios";const c=o==="android";const r=t.getNumber("keyboardHeight",290);const a=t.getBoolean("scrollAssist",true);const u=t.getBoolean("hideCaretOnScroll",e);const f=t.getBoolean("inputBlurring",e);const l=t.getBoolean("scrollPadding",true);const d=Array.from(s.querySelectorAll("ion-input, ion-textarea"));const p=new WeakMap;const m=new WeakMap;const S=async t=>{await new Promise((o=>i(t,o)));const o=t.shadowRoot||t;const s=o.querySelector("input")||o.querySelector("textarea");const e=n(t);const f=!e?t.closest("ion-footer"):null;if(!s){return}if(!!e&&u&&!p.has(t)){const o=w(t,s,e);p.set(t,o)}const l=s.type==="date"||s.type==="datetime-local";if(!l&&(!!e||!!f)&&a&&!m.has(t)){const o=y(t,s,e,f,r,c);m.set(t,o)}};const b=t=>{if(u){const o=p.get(t);if(o){o()}p.delete(t)}if(a){const o=m.get(t);if(o){o()}m.delete(t)}};if(f&&g){h()}if(l&&k){x(r)}for(const t of d){S(t)}s.addEventListener("ionInputDidLoad",(t=>{S(t.detail)}));s.addEventListener("ionInputDidUnload",(t=>{b(t.detail)}))};export{I as startInputShims};
//# sourceMappingURL=p-a4edd8a8.js.map