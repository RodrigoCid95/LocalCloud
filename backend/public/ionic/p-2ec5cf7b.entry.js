import{r as t,e as i,h as s,d as e}from"./p-c36f36fa.js";import{g as a,c as n}from"./p-c57c31a3.js";import{g as o}from"./p-2f802871.js";import{a as h,d as r}from"./p-1327f220.js";import{s as l}from"./p-f08587bc.js";import{t as c}from"./p-760b72dd.js";const d=":host{left:0;right:0;top:0;bottom:0;position:absolute;contain:layout size style;overflow:hidden;z-index:0}";const f=class{constructor(s){t(this,s);this.ionNavWillLoad=i(this,"ionNavWillLoad",7);this.ionNavWillChange=i(this,"ionNavWillChange",3);this.ionNavDidChange=i(this,"ionNavDidChange",3);this.gestureOrAnimationInProgress=false;this.mode=a(this);this.animated=true}swipeHandlerChanged(){if(this.gesture){this.gesture.enable(this.swipeHandler!==undefined)}}async connectedCallback(){const t=()=>{this.gestureOrAnimationInProgress=true;if(this.swipeHandler){this.swipeHandler.onStart()}};this.gesture=(await import("./p-fdff30e3.js")).createSwipeBackGesture(this.el,(()=>!this.gestureOrAnimationInProgress&&!!this.swipeHandler&&this.swipeHandler.canStart()),(()=>t()),(t=>{var i;return(i=this.ani)===null||i===void 0?void 0:i.progressStep(t)}),((t,i,s)=>{if(this.ani){this.ani.onFinish((()=>{this.gestureOrAnimationInProgress=false;if(this.swipeHandler){this.swipeHandler.onEnd(t)}}),{oneTimeCallback:true});let e=t?-.001:.001;if(!t){this.ani.easing("cubic-bezier(1, 0, 0.68, 0.28)");e+=o([0,0],[1,0],[.68,.28],[1,1],i)[0]}else{e+=o([0,0],[.32,.72],[0,1],[1,1],i)[0]}this.ani.progressEnd(t?1:0,e,s)}else{this.gestureOrAnimationInProgress=false}}));this.swipeHandlerChanged()}componentWillLoad(){this.ionNavWillLoad.emit()}disconnectedCallback(){if(this.gesture){this.gesture.destroy();this.gesture=undefined}}async commit(t,i,s){const e=await this.lock();let a=false;try{a=await this.transition(t,i,s)}catch(t){console.error(t)}e();return a}async setRouteId(t,i,s,e){const a=await this.setRoot(t,i,{duration:s==="root"?0:undefined,direction:s==="back"?"back":"forward",animationBuilder:e});return{changed:a,element:this.activeEl}}async getRouteId(){const t=this.activeEl;return t?{id:t.tagName,element:t,params:this.activeParams}:undefined}async setRoot(t,i,s){if(this.activeComponent===t&&l(i,this.activeParams)){return false}const e=this.activeEl;const a=await h(this.delegate,this.el,t,["ion-page","ion-page-invisible"],i);this.activeComponent=t;this.activeEl=a;this.activeParams=i;await this.commit(a,e,s);await r(this.delegate,e);return true}async transition(t,i,s={}){if(i===t){return false}this.ionNavWillChange.emit();const{el:e,mode:a}=this;const o=this.animated&&n.getBoolean("animated",true);const h=s.animationBuilder||this.animation||n.get("navAnimation");await c(Object.assign(Object.assign({mode:a,animated:o,enteringEl:t,leavingEl:i,baseEl:e,progressCallback:s.progressAnimation?t=>{if(t!==undefined&&!this.gestureOrAnimationInProgress){this.gestureOrAnimationInProgress=true;t.onFinish((()=>{this.gestureOrAnimationInProgress=false;if(this.swipeHandler){this.swipeHandler.onEnd(false)}}),{oneTimeCallback:true});t.progressEnd(0,0,0)}else{this.ani=t}}:undefined},s),{animationBuilder:h}));this.ionNavDidChange.emit();return true}async lock(){const t=this.waitPromise;let i;this.waitPromise=new Promise((t=>i=t));if(t!==undefined){await t}return i}render(){return s("slot",null)}get el(){return e(this)}static get watchers(){return{swipeHandler:["swipeHandlerChanged"]}}};f.style=d;export{f as ion_router_outlet};
//# sourceMappingURL=p-2ec5cf7b.entry.js.map