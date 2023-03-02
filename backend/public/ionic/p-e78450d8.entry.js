import{r as t,e as o,h as a,H as i,d as n}from"./p-c36f36fa.js";import{c as r,g as e}from"./p-c57c31a3.js";import{p as s}from"./p-28e84784.js";import{i as d,a as p,b as l,d as c,e as u,s as h}from"./p-c03ef3ad.js";import{s as g}from"./p-3773f7d4.js";import{g as b,c as m}from"./p-0e4de1d0.js";import{c as f}from"./p-8cf07f1c.js";import{g as x}from"./p-f08587bc.js";import"./p-add30d46.js";import"./p-924f3f49.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const w=(t,o)=>{const a=f();const i=f();const n=x(t);const r=n.querySelector(".toast-wrapper");const e=`calc(-10px - var(--ion-safe-area-bottom, 0px))`;const s=`calc(10px + var(--ion-safe-area-top, 0px))`;i.addElement(r);switch(o){case"top":i.fromTo("transform","translateY(-100%)",`translateY(${s})`);break;case"middle":const o=Math.floor(t.clientHeight/2-r.clientHeight/2);r.style.top=`${o}px`;i.fromTo("opacity",.01,1);break;default:i.fromTo("transform","translateY(100%)",`translateY(${e})`);break}return a.easing("cubic-bezier(.155,1.105,.295,1.12)").duration(400).addAnimation(i)};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const v=(t,o)=>{const a=f();const i=f();const n=x(t);const r=n.querySelector(".toast-wrapper");const e=`calc(-10px - var(--ion-safe-area-bottom, 0px))`;const s=`calc(10px + var(--ion-safe-area-top, 0px))`;i.addElement(r);switch(o){case"top":i.fromTo("transform",`translateY(${s})`,"translateY(-100%)");break;case"middle":i.fromTo("opacity",.99,0);break;default:i.fromTo("transform",`translateY(${e})`,"translateY(100%)");break}return a.easing("cubic-bezier(.36,.66,.04,1)").duration(300).addAnimation(i)};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const y=(t,o)=>{const a=f();const i=f();const n=x(t);const r=n.querySelector(".toast-wrapper");const e=`calc(8px + var(--ion-safe-area-bottom, 0px))`;const s=`calc(8px + var(--ion-safe-area-top, 0px))`;i.addElement(r);switch(o){case"top":r.style.top=s;i.fromTo("opacity",.01,1);break;case"middle":const o=Math.floor(t.clientHeight/2-r.clientHeight/2);r.style.top=`${o}px`;i.fromTo("opacity",.01,1);break;default:r.style.bottom=e;i.fromTo("opacity",.01,1);break}return a.easing("cubic-bezier(.36,.66,.04,1)").duration(400).addAnimation(i)};
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const k=t=>{const o=f();const a=f();const i=x(t);const n=i.querySelector(".toast-wrapper");a.addElement(n).fromTo("opacity",.99,0);return o.easing("cubic-bezier(.36,.66,.04,1)").duration(300).addAnimation(a)};const j=":host{--border-width:0;--border-style:none;--border-color:initial;--box-shadow:none;--min-width:auto;--width:auto;--min-height:auto;--height:auto;--max-height:auto;--white-space:normal;left:0;top:0;display:block;position:absolute;width:100%;height:100%;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);contain:strict;z-index:1001;pointer-events:none}:host-context([dir=rtl]){left:unset;right:unset;right:0}:host(.overlay-hidden){display:none}:host(.ion-color){--button-color:inherit;color:var(--ion-color-contrast)}:host(.ion-color) .toast-button-cancel{color:inherit}:host(.ion-color) .toast-wrapper{background:var(--ion-color-base)}.toast-wrapper{border-radius:var(--border-radius);left:var(--start);right:var(--end);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);box-shadow:var(--box-shadow)}[dir=rtl] .toast-wrapper,:host-context([dir=rtl]) .toast-wrapper{left:unset;right:unset;left:var(--end);right:var(--start)}.toast-container{display:flex;align-items:center;pointer-events:auto;height:inherit;min-height:inherit;max-height:inherit;contain:content}.toast-layout-stacked .toast-container{flex-wrap:wrap}.toast-layout-baseline .toast-content{display:flex;flex:1;flex-direction:column;justify-content:center}.toast-icon{margin-left:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-icon{margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}.toast-message{flex:1;white-space:var(--white-space)}.toast-button-group{display:flex}.toast-layout-stacked .toast-button-group{justify-content:end;width:100%}.toast-button{border:0;outline:none;color:var(--button-color);z-index:0}.toast-icon,.toast-button-icon{font-size:1.4em}.toast-button-inner{display:flex;align-items:center}@media (any-hover: hover){.toast-button:hover{cursor:pointer}}:host{--background:var(--ion-color-step-50, #f2f2f2);--border-radius:14px;--button-color:var(--ion-color-primary, #3880ff);--color:var(--ion-color-step-850, #262626);--max-width:700px;--start:10px;--end:10px;font-size:14px}.toast-wrapper{margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;display:block;position:absolute;z-index:10}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-wrapper{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}@supports (backdrop-filter: blur(0)){:host(.toast-translucent) .toast-wrapper{background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);backdrop-filter:saturate(180%) blur(20px)}}.toast-wrapper.toast-top{transform:translate3d(0,  -100%,  0);top:0}.toast-wrapper.toast-middle{opacity:0.01}.toast-wrapper.toast-bottom{transform:translate3d(0,  100%,  0);bottom:0}.toast-content{padding-left:15px;padding-right:15px;padding-top:15px;padding-bottom:15px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-content{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-header{margin-bottom:2px;font-weight:500}.toast-button{padding-left:15px;padding-right:15px;padding-top:10px;padding-bottom:10px;height:44px;transition:background-color, opacity 100ms linear;border:0;background-color:transparent;font-family:var(--ion-font-family);font-size:17px;font-weight:500;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-button{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-button.ion-activated{opacity:0.4}@media (any-hover: hover){.toast-button:hover{opacity:0.6}}";const z=":host{--border-width:0;--border-style:none;--border-color:initial;--box-shadow:none;--min-width:auto;--width:auto;--min-height:auto;--height:auto;--max-height:auto;--white-space:normal;left:0;top:0;display:block;position:absolute;width:100%;height:100%;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);contain:strict;z-index:1001;pointer-events:none}:host-context([dir=rtl]){left:unset;right:unset;right:0}:host(.overlay-hidden){display:none}:host(.ion-color){--button-color:inherit;color:var(--ion-color-contrast)}:host(.ion-color) .toast-button-cancel{color:inherit}:host(.ion-color) .toast-wrapper{background:var(--ion-color-base)}.toast-wrapper{border-radius:var(--border-radius);left:var(--start);right:var(--end);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);box-shadow:var(--box-shadow)}[dir=rtl] .toast-wrapper,:host-context([dir=rtl]) .toast-wrapper{left:unset;right:unset;left:var(--end);right:var(--start)}.toast-container{display:flex;align-items:center;pointer-events:auto;height:inherit;min-height:inherit;max-height:inherit;contain:content}.toast-layout-stacked .toast-container{flex-wrap:wrap}.toast-layout-baseline .toast-content{display:flex;flex:1;flex-direction:column;justify-content:center}.toast-icon{margin-left:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-icon{margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}.toast-message{flex:1;white-space:var(--white-space)}.toast-button-group{display:flex}.toast-layout-stacked .toast-button-group{justify-content:end;width:100%}.toast-button{border:0;outline:none;color:var(--button-color);z-index:0}.toast-icon,.toast-button-icon{font-size:1.4em}.toast-button-inner{display:flex;align-items:center}@media (any-hover: hover){.toast-button:hover{cursor:pointer}}:host{--background:var(--ion-color-step-800, #333333);--border-radius:4px;--box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);--button-color:var(--ion-color-primary, #3880ff);--color:var(--ion-color-step-50, #f2f2f2);--max-width:700px;--start:8px;--end:8px;font-size:14px}.toast-wrapper{margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;display:block;position:absolute;opacity:0.01;z-index:10}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-wrapper{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}.toast-content{padding-left:16px;padding-right:16px;padding-top:14px;padding-bottom:14px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-content{padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}.toast-header{margin-bottom:2px;font-weight:500;line-height:20px}.toast-message{line-height:20px}.toast-layout-baseline .toast-button-group-start{margin-left:8px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-layout-baseline .toast-button-group-start{margin-left:unset;-webkit-margin-start:8px;margin-inline-start:8px}}.toast-layout-stacked .toast-button-group-start{margin-right:8px;margin-top:8px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-layout-stacked .toast-button-group-start{margin-right:unset;-webkit-margin-end:8px;margin-inline-end:8px}}.toast-layout-baseline .toast-button-group-end{margin-right:8px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-layout-baseline .toast-button-group-end{margin-right:unset;-webkit-margin-end:8px;margin-inline-end:8px}}.toast-layout-stacked .toast-button-group-end{margin-right:8px;margin-bottom:8px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-layout-stacked .toast-button-group-end{margin-right:unset;-webkit-margin-end:8px;margin-inline-end:8px}}.toast-button{padding-left:15px;padding-right:15px;padding-top:10px;padding-bottom:10px;position:relative;background-color:transparent;font-family:var(--ion-font-family);font-size:14px;font-weight:500;letter-spacing:0.84px;text-transform:uppercase;overflow:hidden}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-button{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-button-cancel{color:var(--ion-color-step-100, #e6e6e6)}.toast-button-icon-only{border-radius:50%;padding-left:9px;padding-right:9px;padding-top:9px;padding-bottom:9px;width:36px;height:36px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.toast-button-icon-only{padding-left:unset;padding-right:unset;-webkit-padding-start:9px;padding-inline-start:9px;-webkit-padding-end:9px;padding-inline-end:9px}}@media (any-hover: hover){.toast-button:hover{background-color:rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.08)}.toast-button-cancel:hover{background-color:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.08)}}";const D=class{constructor(a){t(this,a);this.didPresent=o(this,"ionToastDidPresent",7);this.willPresent=o(this,"ionToastWillPresent",7);this.willDismiss=o(this,"ionToastWillDismiss",7);this.didDismiss=o(this,"ionToastDidDismiss",7);this.presented=false;this.duration=r.getNumber("toastDuration",0);this.layout="baseline";this.keyboardClose=false;this.position="bottom";this.translucent=false;this.animated=true;this.dispatchCancelHandler=t=>{const o=t.detail.role;if(d(o)){const t=this.getButtons().find((t=>t.role==="cancel"));this.callButtonHandler(t)}}}connectedCallback(){p(this.el)}async present(){await l(this,"toastEnter",w,y,this.position);if(this.duration>0){this.durationTimeout=setTimeout((()=>this.dismiss(undefined,"timeout")),this.duration)}}dismiss(t,o){if(this.durationTimeout){clearTimeout(this.durationTimeout)}return c(this,t,o,"toastLeave",v,k,this.position)}onDidDismiss(){return u(this.el,"ionToastDidDismiss")}onWillDismiss(){return u(this.el,"ionToastWillDismiss")}getButtons(){const t=this.buttons?this.buttons.map((t=>typeof t==="string"?{text:t}:t)):[];return t}async buttonClick(t){const o=t.role;if(d(o)){return this.dismiss(undefined,o)}const a=await this.callButtonHandler(t);if(a){return this.dismiss(undefined,o)}return Promise.resolve()}async callButtonHandler(t){if(t===null||t===void 0?void 0:t.handler){try{const o=await h(t.handler);if(o===false){return false}}catch(t){console.error(t)}}return true}renderButtons(t,o){if(t.length===0){return}const i=e(this);const n={"toast-button-group":true,[`toast-button-group-${o}`]:true};return a("div",{class:n},t.map((t=>a("button",{type:"button",class:T(t),tabIndex:0,onClick:()=>this.buttonClick(t),part:"button"},a("div",{class:"toast-button-inner"},t.icon&&a("ion-icon",{icon:t.icon,slot:t.text===undefined?"icon-only":undefined,class:"toast-button-icon"}),t.text),i==="md"&&a("ion-ripple-effect",{type:t.icon!==undefined&&t.text===undefined?"unbounded":"bounded"})))))}render(){const{layout:t,el:o}=this;const n=this.getButtons();const r=n.filter((t=>t.side==="start"));const d=n.filter((t=>t.side!=="start"));const p=e(this);const l={"toast-wrapper":true,[`toast-${this.position}`]:true,[`toast-layout-${t}`]:true};const c=n.length>0?"dialog":"status";if(t==="stacked"&&r.length>0&&d.length>0){s("This toast is using start and end buttons with the stacked toast layout. We recommend following the best practice of using either start or end buttons with the stacked toast layout.",o)}return a(i,Object.assign({"aria-live":"polite","aria-atomic":"true",role:c,tabindex:"-1"},this.htmlAttributes,{style:{zIndex:`${6e4+this.overlayIndex}`},class:m(this.color,Object.assign(Object.assign({[p]:true},b(this.cssClass)),{"overlay-hidden":true,"toast-translucent":this.translucent})),onIonToastWillDismiss:this.dispatchCancelHandler}),a("div",{class:l},a("div",{class:"toast-container",part:"container"},this.renderButtons(r,"start"),this.icon!==undefined&&a("ion-icon",{class:"toast-icon",part:"icon",icon:this.icon,lazy:false,"aria-hidden":"true"}),a("div",{class:"toast-content"},this.header!==undefined&&a("div",{class:"toast-header",part:"header"},this.header),this.message!==undefined&&a("div",{class:"toast-message",part:"message",innerHTML:g(this.message)})),this.renderButtons(d,"end"))))}get el(){return n(this)}};const T=t=>Object.assign({"toast-button":true,"toast-button-icon-only":t.icon!==undefined&&t.text===undefined,[`toast-button-${t.role}`]:t.role!==undefined,"ion-focusable":true,"ion-activatable":true},b(t.cssClass));D.style={ios:j,md:z};export{D as ion_toast};
//# sourceMappingURL=p-e78450d8.entry.js.map