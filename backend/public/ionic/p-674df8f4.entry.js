import{r as t,h as o,H as i,d as n}from"./p-c36f36fa.js";import{c as e}from"./p-4a041d58.js";import{c as s,g as a}from"./p-c57c31a3.js";import{b as c,a as r,r as d,g as h,t as l}from"./p-f08587bc.js";const f=":host{display:block;position:relative;width:100%;background-color:var(--ion-background-color, #ffffff);overflow:hidden;z-index:0}:host(.accordion-expanding) ::slotted(ion-item[slot=header]),:host(.accordion-expanded) ::slotted(ion-item[slot=header]){--border-width:0px}:host(.accordion-animated){transition:all 300ms cubic-bezier(0.25, 0.8, 0.5, 1)}:host(.accordion-animated) #content{transition:max-height 300ms cubic-bezier(0.25, 0.8, 0.5, 1)}#content{overflow:hidden;will-change:max-height}:host(.accordion-collapsing) #content{max-height:0 !important}:host(.accordion-collapsed) #content{display:none}:host(.accordion-expanding) #content{max-height:0}:host(.accordion-disabled) #header,:host(.accordion-readonly) #header,:host(.accordion-disabled) #content,:host(.accordion-readonly) #content{pointer-events:none}:host(.accordion-disabled) #header,:host(.accordion-disabled) #content{opacity:0.4}@media (prefers-reduced-motion: reduce){:host,#content{transition:none !important}}:host(.accordion-next) ::slotted(ion-item[slot=header]){--border-width:0.55px 0px 0.55px 0px}";const u=":host{display:block;position:relative;width:100%;background-color:var(--ion-background-color, #ffffff);overflow:hidden;z-index:0}:host(.accordion-expanding) ::slotted(ion-item[slot=header]),:host(.accordion-expanded) ::slotted(ion-item[slot=header]){--border-width:0px}:host(.accordion-animated){transition:all 300ms cubic-bezier(0.25, 0.8, 0.5, 1)}:host(.accordion-animated) #content{transition:max-height 300ms cubic-bezier(0.25, 0.8, 0.5, 1)}#content{overflow:hidden;will-change:max-height}:host(.accordion-collapsing) #content{max-height:0 !important}:host(.accordion-collapsed) #content{display:none}:host(.accordion-expanding) #content{max-height:0}:host(.accordion-disabled) #header,:host(.accordion-readonly) #header,:host(.accordion-disabled) #content,:host(.accordion-readonly) #content{pointer-events:none}:host(.accordion-disabled) #header,:host(.accordion-disabled) #content{opacity:0.4}@media (prefers-reduced-motion: reduce){:host,#content{transition:none !important}}";const p=class{constructor(o){t(this,o);this.updateListener=()=>this.updateState(false);this.state=1;this.isNext=false;this.isPrevious=false;this.value=`ion-accordion-${m++}`;this.disabled=false;this.readonly=false;this.toggleIcon=e;this.toggleIconSlot="end";this.setItemDefaults=()=>{const t=this.getSlottedHeaderIonItem();if(!t){return}t.button=true;t.detail=false;if(t.lines===undefined){t.lines="full"}};this.getSlottedHeaderIonItem=()=>{const{headerEl:t}=this;if(!t){return}const o=t.querySelector("slot");if(!o){return}if(o.assignedElements===undefined)return;return o.assignedElements().find((t=>t.tagName==="ION-ITEM"))};this.setAria=(t=false)=>{const o=this.getSlottedHeaderIonItem();if(!o){return}const i=h(o);const n=i.querySelector("button");if(!n){return}n.setAttribute("aria-expanded",`${t}`)};this.slotToggleIcon=()=>{const t=this.getSlottedHeaderIonItem();if(!t){return}const{toggleIconSlot:o,toggleIcon:i}=this;const n=t.querySelector(".ion-accordion-toggle-icon");if(n){return}const e=document.createElement("ion-icon");e.slot=o;e.lazy=false;e.classList.add("ion-accordion-toggle-icon");e.icon=i;e.setAttribute("aria-hidden","true");t.appendChild(e)};this.expandAccordion=(t=false)=>{const{contentEl:o,contentElWrapper:i}=this;if(t||o===undefined||i===undefined){this.state=4;return}if(this.state===4){return}if(this.currentRaf!==undefined){cancelAnimationFrame(this.currentRaf)}if(this.shouldAnimate()){c((()=>{this.state=8;this.currentRaf=c((async()=>{const t=i.offsetHeight;const n=l(o,2e3);o.style.setProperty("max-height",`${t}px`);await n;this.state=4;o.style.removeProperty("max-height")}))}))}else{this.state=4}};this.collapseAccordion=(t=false)=>{const{contentEl:o}=this;if(t||o===undefined){this.state=1;return}if(this.state===1){return}if(this.currentRaf!==undefined){cancelAnimationFrame(this.currentRaf)}if(this.shouldAnimate()){this.currentRaf=c((async()=>{const t=o.offsetHeight;o.style.setProperty("max-height",`${t}px`);c((async()=>{const t=l(o,2e3);this.state=2;await t;this.state=1;o.style.removeProperty("max-height")}))}))}else{this.state=1}};this.shouldAnimate=()=>{if(typeof window==="undefined"){return false}const t=matchMedia("(prefers-reduced-motion: reduce)").matches;if(t){return false}const o=s.get("animated",true);if(!o){return false}if(this.accordionGroupEl&&!this.accordionGroupEl.animated){return false}return true};this.updateState=async(t=false)=>{const o=this.accordionGroupEl;const i=this.value;if(!o){return}const n=o.value;const e=Array.isArray(n)?n.includes(i):n===i;if(e){this.expandAccordion(t);this.isNext=this.isPrevious=false}else{this.collapseAccordion(t);const o=this.getNextSibling();const i=o===null||o===void 0?void 0:o.value;if(i!==undefined){this.isPrevious=Array.isArray(n)?n.includes(i):n===i}const e=this.getPreviousSibling();const s=e===null||e===void 0?void 0:e.value;if(s!==undefined){this.isNext=Array.isArray(n)?n.includes(s):n===s}}};this.getNextSibling=()=>{if(!this.el){return}const t=this.el.nextElementSibling;if((t===null||t===void 0?void 0:t.tagName)!=="ION-ACCORDION"){return}return t};this.getPreviousSibling=()=>{if(!this.el){return}const t=this.el.previousElementSibling;if((t===null||t===void 0?void 0:t.tagName)!=="ION-ACCORDION"){return}return t}}connectedCallback(){var t;const o=this.accordionGroupEl=(t=this.el)===null||t===void 0?void 0:t.closest("ion-accordion-group");if(o){this.updateState(true);r(o,"ionChange",this.updateListener)}}disconnectedCallback(){const t=this.accordionGroupEl;if(t){d(t,"ionChange",this.updateListener)}}componentDidLoad(){this.setItemDefaults();this.slotToggleIcon();c((()=>{const t=this.state===4||this.state===8;this.setAria(t)}))}toggleExpanded(){const{accordionGroupEl:t,value:o,state:i}=this;if(t){const n=i===1||i===2;t.requestAccordionToggle(o,n)}}render(){const{disabled:t,readonly:n}=this;const e=a(this);const c=this.state===4||this.state===8;const r=c?"header expanded":"header";const d=c?"content expanded":"content";this.setAria(c);return o(i,{class:{[e]:true,"accordion-expanding":this.state===8,"accordion-expanded":this.state===4,"accordion-collapsing":this.state===2,"accordion-collapsed":this.state===1,"accordion-next":this.isNext,"accordion-previous":this.isPrevious,"accordion-disabled":t,"accordion-readonly":n,"accordion-animated":s.getBoolean("animated",true)}},o("div",{onClick:()=>this.toggleExpanded(),id:"header",part:r,"aria-controls":"content",ref:t=>this.headerEl=t},o("slot",{name:"header"})),o("div",{id:"content",part:d,role:"region","aria-labelledby":"header",ref:t=>this.contentEl=t},o("div",{id:"content-wrapper",ref:t=>this.contentElWrapper=t},o("slot",{name:"content"}))))}static get delegatesFocus(){return true}get el(){return n(this)}};let m=0;p.style={ios:f,md:u};export{p as ion_accordion};
//# sourceMappingURL=p-674df8f4.entry.js.map