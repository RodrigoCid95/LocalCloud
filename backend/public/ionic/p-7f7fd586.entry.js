import{r as t,e as o,h as s,H as i,d as n}from"./p-c36f36fa.js";import{g as a}from"./p-c57c31a3.js";import{c as r,h as e}from"./p-0e4de1d0.js";const l=":host{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:flex;flex-wrap:wrap;align-items:center}:host(.in-toolbar-color),:host(.in-toolbar-color) .breadcrumbs-collapsed-indicator ion-icon{color:var(--ion-color-contrast)}:host(.in-toolbar-color) .breadcrumbs-collapsed-indicator{background:rgba(var(--ion-color-contrast-rgb), 0.11)}:host(.in-toolbar){padding-left:20px;padding-right:20px;padding-top:0;padding-bottom:0;justify-content:center}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host(.in-toolbar){padding-left:unset;padding-right:unset;-webkit-padding-start:20px;padding-inline-start:20px;-webkit-padding-end:20px;padding-inline-end:20px}}";const d=":host{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:flex;flex-wrap:wrap;align-items:center}:host(.in-toolbar-color),:host(.in-toolbar-color) .breadcrumbs-collapsed-indicator ion-icon{color:var(--ion-color-contrast)}:host(.in-toolbar-color) .breadcrumbs-collapsed-indicator{background:rgba(var(--ion-color-contrast-rgb), 0.11)}:host(.in-toolbar){padding-left:8px;padding-right:8px;padding-top:0;padding-bottom:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host(.in-toolbar){padding-left:unset;padding-right:unset;-webkit-padding-start:8px;padding-inline-start:8px;-webkit-padding-end:8px;padding-inline-end:8px}}";const c=class{constructor(s){t(this,s);this.ionCollapsedClick=o(this,"ionCollapsedClick",7);this.itemsBeforeCollapse=1;this.itemsAfterCollapse=1;this.breadcrumbsInit=()=>{this.setBreadcrumbSeparator();this.setMaxItems()};this.resetActiveBreadcrumb=()=>{const t=this.getBreadcrumbs();const o=t.find((t=>t.active));if(o&&this.activeChanged){o.active=false}};this.setMaxItems=()=>{const{itemsAfterCollapse:t,itemsBeforeCollapse:o,maxItems:s}=this;const i=this.getBreadcrumbs();for(const t of i){t.showCollapsedIndicator=false;t.collapsed=false}const n=s!==undefined&&i.length>s&&o+t<=s;if(n){i.forEach(((s,n)=>{if(n===o){s.showCollapsedIndicator=true}if(n>=o&&n<i.length-t){s.collapsed=true}}))}};this.setBreadcrumbSeparator=()=>{const{itemsAfterCollapse:t,itemsBeforeCollapse:o,maxItems:s}=this;const i=this.getBreadcrumbs();const n=i.find((t=>t.active));for(const a of i){const r=s!==undefined&&t===0?a===i[o]:a===i[i.length-1];a.last=r;const e=a.separator!==undefined?a.separator:r?undefined:true;a.separator=e;if(!n&&r){a.active=true;this.activeChanged=true}}};this.getBreadcrumbs=()=>Array.from(this.el.querySelectorAll("ion-breadcrumb"));this.slotChanged=()=>{this.resetActiveBreadcrumb();this.breadcrumbsInit()}}onCollapsedClick(t){const o=this.getBreadcrumbs();const s=o.filter((t=>t.collapsed));this.ionCollapsedClick.emit(Object.assign(Object.assign({},t.detail),{collapsedBreadcrumbs:s}))}maxItemsChanged(){this.resetActiveBreadcrumb();this.breadcrumbsInit()}componentWillLoad(){this.breadcrumbsInit()}render(){const{color:t,collapsed:o}=this;const n=a(this);return s(i,{class:r(t,{[n]:true,"in-toolbar":e("ion-toolbar",this.el),"in-toolbar-color":e("ion-toolbar[color]",this.el),"breadcrumbs-collapsed":o})},s("slot",{onSlotchange:this.slotChanged}))}get el(){return n(this)}static get watchers(){return{maxItems:["maxItemsChanged"],itemsBeforeCollapse:["maxItemsChanged"],itemsAfterCollapse:["maxItemsChanged"]}}};c.style={ios:l,md:d};export{c as ion_breadcrumbs};
//# sourceMappingURL=p-7f7fd586.entry.js.map