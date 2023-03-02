import{r as t,h as e,H as i,d as n}from"./p-c36f36fa.js";import{g as a}from"./p-c57c31a3.js";import{a as s,c as o}from"./p-f08587bc.js";import{a as r}from"./p-28e84784.js";import{c as d}from"./p-0e4de1d0.js";import{q as c,t as l,J as p,S as m,G as h,K as u,T as b}from"./p-86e55970.js";const f=":host{display:flex;align-items:center;justify-content:center}:host button{border-radius:8px;padding-left:12px;padding-right:12px;padding-top:6px;padding-bottom:6px;margin-left:2px;margin-right:2px;margin-top:0px;margin-bottom:0px;position:relative;transition:150ms color ease-in-out;border:none;background:var(--ion-color-step-300, #edeef0);color:var(--ion-text-color, #000);font-family:inherit;font-size:inherit;cursor:pointer;appearance:none;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{padding-left:unset;padding-right:unset;-webkit-padding-start:12px;padding-inline-start:12px;-webkit-padding-end:12px;padding-inline-end:12px}}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.time-active) #time-button,:host(.date-active) #date-button{color:var(--ion-color-base)}:host(.datetime-button-disabled){pointer-events:none}:host(.datetime-button-disabled) button{opacity:0.4}";const g=":host{display:flex;align-items:center;justify-content:center}:host button{border-radius:8px;padding-left:12px;padding-right:12px;padding-top:6px;padding-bottom:6px;margin-left:2px;margin-right:2px;margin-top:0px;margin-bottom:0px;position:relative;transition:150ms color ease-in-out;border:none;background:var(--ion-color-step-300, #edeef0);color:var(--ion-text-color, #000);font-family:inherit;font-size:inherit;cursor:pointer;appearance:none;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{padding-left:unset;padding-right:unset;-webkit-padding-start:12px;padding-inline-start:12px;-webkit-padding-end:12px;padding-inline-end:12px}}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host button{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}:host(.time-active) #time-button,:host(.date-active) #date-button{color:var(--ion-color-base)}:host(.datetime-button-disabled){pointer-events:none}:host(.datetime-button-disabled) button{opacity:0.4}";const x=class{constructor(e){t(this,e);this.datetimeEl=null;this.overlayEl=null;this.datetimePresentation="date-time";this.datetimeActive=false;this.color="primary";this.disabled=false;this.getParsedDateValues=t=>{if(t===""||t===undefined||t===null){return[]}if(Array.isArray(t)){return t}return[t]};this.setDateTimeText=()=>{const{datetimeEl:t,datetimePresentation:e}=this;if(!t){return}const{value:i,locale:n,hourCycle:a,preferWheel:s,multiple:o,titleSelectedDatesFormatter:d}=t;const f=this.getParsedDateValues(i);const g=c(f.length>0?f:[l()]);const x=g[0];const v=p(n,a);g.forEach((t=>{t.tzOffset=undefined}));this.dateText=this.timeText=undefined;switch(e){case"date-time":case"time-date":const t=b(n,x);const e=u(n,x,v);if(s){this.dateText=`${t} ${e}`}else{this.dateText=t;this.timeText=e}break;case"date":if(o&&f.length!==1){let t=`${f.length} days`;if(d!==undefined){try{t=d(f)}catch(t){r("Exception in provided `titleSelectedDatesFormatter`: ",t)}}this.dateText=t}else{this.dateText=b(n,x)}break;case"time":this.timeText=u(n,x,v);break;case"month-year":this.dateText=h(n,x);break;case"month":this.dateText=m(n,x,{month:"long"});break;case"year":this.dateText=m(n,x,{year:"numeric"});break}};this.waitForDatetimeChanges=async()=>{const{datetimeEl:t}=this;if(!t){return Promise.resolve()}return new Promise((e=>{s(t,"ionRender",e,{once:true})}))};this.handleDateClick=async t=>{const{datetimeEl:e,datetimePresentation:i}=this;if(!e){return}let n=false;switch(i){case"date-time":case"time-date":const t=e.presentation!=="date";if(!e.preferWheel&&t){e.presentation="date";n=true}break}this.selectedButton="date";this.presentOverlay(t,n,this.dateTargetEl)};this.handleTimeClick=t=>{const{datetimeEl:e,datetimePresentation:i}=this;if(!e){return}let n=false;switch(i){case"date-time":case"time-date":const t=e.presentation!=="time";if(t){e.presentation="time";n=true}break}this.selectedButton="time";this.presentOverlay(t,n,this.timeTargetEl)};this.presentOverlay=async(t,e,i)=>{const{overlayEl:n}=this;if(!n){return}if(n.tagName==="ION-POPOVER"){if(e){await this.waitForDatetimeChanges()}n.present(Object.assign(Object.assign({},t),{detail:{ionShadowTarget:i}}))}else{n.present()}}}async componentWillLoad(){const{datetime:t}=this;if(!t){r("An ID associated with an ion-datetime instance is required for ion-datetime-button to function properly.",this.el);return}const e=this.datetimeEl=document.getElementById(t);if(!e){r(`No ion-datetime instance found for ID '${t}'.`,this.el);return}const i=new IntersectionObserver((t=>{const e=t[0];this.datetimeActive=e.isIntersecting}),{threshold:.01});i.observe(e);const n=this.overlayEl=e.closest("ion-modal, ion-popover");if(n){n.classList.add("ion-datetime-button-overlay")}o(e,(()=>{const t=this.datetimePresentation=e.presentation||"date-time";this.setDateTimeText();s(e,"ionChange",this.setDateTimeText);switch(t){case"date-time":case"date":case"month-year":case"month":case"year":this.selectedButton="date";break;case"time-date":case"time":this.selectedButton="time";break}}))}render(){const{color:t,dateText:n,timeText:s,selectedButton:o,datetimeActive:r,disabled:c}=this;const l=a(this);return e(i,{class:d(t,{[l]:true,[`${o}-active`]:r,["datetime-button-disabled"]:c})},n&&e("button",{class:"ion-activatable",id:"date-button","aria-expanded":r?"true":"false",onClick:this.handleDateClick,disabled:c,part:"native",ref:t=>this.dateTargetEl=t},e("slot",{name:"date-target"},n),l==="md"&&e("ion-ripple-effect",null)),s&&e("button",{class:"ion-activatable",id:"time-button","aria-expanded":r?"true":"false",onClick:this.handleTimeClick,disabled:c,part:"native",ref:t=>this.timeTargetEl=t},e("slot",{name:"time-target"},s),l==="md"&&e("ion-ripple-effect",null)))}get el(){return n(this)}};x.style={ios:f,md:g};export{x as ion_datetime_button};
//# sourceMappingURL=p-32c842bd.entry.js.map