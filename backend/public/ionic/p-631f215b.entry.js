import{r as t,e as o,i,f as s,h as n,H as e,d as r}from"./p-c36f36fa.js";import{g as l,a}from"./p-c57c31a3.js";import{c}from"./p-f08587bc.js";import{i as h}from"./p-506221fe.js";import{c as d,h as f}from"./p-0e4de1d0.js";const p=':host{--background:var(--ion-background-color, #fff);--color:var(--ion-text-color, #000);--padding-top:0px;--padding-bottom:0px;--padding-start:0px;--padding-end:0px;--keyboard-offset:0px;--offset-top:0px;--offset-bottom:0px;--overflow:auto;display:block;position:relative;flex:1;width:100%;height:100%;margin:0 !important;padding:0 !important;font-family:var(--ion-font-family, inherit);contain:size style}:host(.ion-color) .inner-scroll{background:var(--ion-color-base);color:var(--ion-color-contrast)}:host(.outer-content){--background:var(--ion-color-step-50, #f2f2f2)}#background-content{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);position:absolute;background:var(--background)}.inner-scroll{left:0px;right:0px;top:calc(var(--offset-top) * -1);bottom:calc(var(--offset-bottom) * -1);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:calc(var(--padding-top) + var(--offset-top));padding-bottom:calc(var(--padding-bottom) + var(--keyboard-offset) + var(--offset-bottom));position:absolute;color:var(--color);box-sizing:border-box;overflow:hidden;touch-action:pan-x pan-y pinch-zoom}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.inner-scroll{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.scroll-y,.scroll-x{-webkit-overflow-scrolling:touch;z-index:0;will-change:scroll-position}.scroll-y{overflow-y:var(--overflow);overscroll-behavior-y:contain}.scroll-x{overflow-x:var(--overflow);overscroll-behavior-x:contain}.overscroll::before,.overscroll::after{position:absolute;width:1px;height:1px;content:""}.overscroll::before{bottom:-1px}.overscroll::after{top:-1px}:host(.content-sizing){display:flex;flex-direction:column;min-height:0;contain:none}:host(.content-sizing) .inner-scroll{position:relative;top:0;bottom:0;margin-top:calc(var(--offset-top) * -1);margin-bottom:calc(var(--offset-bottom) * -1)}.transition-effect{display:none;position:absolute;width:100%;height:100vh;opacity:0;pointer-events:none}:host(.content-ltr) .transition-effect{left:-100%;}:host(.content-rtl) .transition-effect{right:-100%;}.transition-cover{position:absolute;right:0;width:100%;height:100%;background:black;opacity:0.1}.transition-shadow{display:block;position:absolute;width:10px;height:100%;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAgCAYAAAAIXrg4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTE3MDgzRkQ5QTkyMTFFOUEwNzQ5MkJFREE1NUY2MjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTE3MDgzRkU5QTkyMTFFOUEwNzQ5MkJFREE1NUY2MjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMTcwODNGQjlBOTIxMUU5QTA3NDkyQkVEQTU1RjYyNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxMTcwODNGQzlBOTIxMUU5QTA3NDkyQkVEQTU1RjYyNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmePEuQAAABNSURBVHjaYvz//z8DIxAwMDAwATGMhmFmPDQuOSZks0AMmoJBaQHjkPfB0Lfg/2gQjVow+HPy/yHvg9GiYjQfjMbBqAWjFgy/4hogwADYqwdzxy5BuwAAAABJRU5ErkJggg==);background-repeat:repeat-y;background-size:10px 16px}:host(.content-ltr) .transition-shadow{right:0;}:host(.content-rtl) .transition-shadow{left:0;transform:scaleX(-1)}::slotted([slot=fixed]){position:absolute;transform:translateZ(0)}';const g=class{constructor(i){t(this,i);this.ionScrollStart=o(this,"ionScrollStart",7);this.ionScroll=o(this,"ionScroll",7);this.ionScrollEnd=o(this,"ionScrollEnd",7);this.watchDog=null;this.isScrolling=false;this.lastScroll=0;this.queued=false;this.cTop=-1;this.cBottom=-1;this.isMainContent=true;this.resizeTimeout=null;this.detail={scrollTop:0,scrollLeft:0,type:"scroll",event:undefined,startX:0,startY:0,startTime:0,currentX:0,currentY:0,velocityX:0,velocityY:0,deltaX:0,deltaY:0,currentTime:0,data:undefined,isScrolling:true};this.fullscreen=false;this.scrollX=false;this.scrollY=true;this.scrollEvents=false}connectedCallback(){this.isMainContent=this.el.closest("ion-menu, ion-popover, ion-modal")===null}disconnectedCallback(){this.onScrollEnd()}onAppLoad(){this.resize()}onResize(){if(this.resizeTimeout){clearTimeout(this.resizeTimeout);this.resizeTimeout=null}this.resizeTimeout=setTimeout((()=>{if(this.el.offsetParent===null){return}this.resize()}),100)}shouldForceOverscroll(){const{forceOverscroll:t}=this;const o=l(this);return t===undefined?o==="ios"&&a("ios"):t}resize(){if(this.fullscreen){i((()=>this.readDimensions()))}else if(this.cTop!==0||this.cBottom!==0){this.cTop=this.cBottom=0;s(this)}}readDimensions(){const t=v(this.el);const o=Math.max(this.el.offsetTop,0);const i=Math.max(t.offsetHeight-o-this.el.offsetHeight,0);const n=o!==this.cTop||i!==this.cBottom;if(n){this.cTop=o;this.cBottom=i;s(this)}}onScroll(t){const o=Date.now();const s=!this.isScrolling;this.lastScroll=o;if(s){this.onScrollStart()}if(!this.queued&&this.scrollEvents){this.queued=true;i((o=>{this.queued=false;this.detail.event=t;b(this.detail,this.scrollEl,o,s);this.ionScroll.emit(this.detail)}))}}async getScrollElement(){if(!this.scrollEl){await new Promise((t=>c(this.el,t)))}return Promise.resolve(this.scrollEl)}async getBackgroundElement(){if(!this.backgroundContentEl){await new Promise((t=>c(this.el,t)))}return Promise.resolve(this.backgroundContentEl)}scrollToTop(t=0){return this.scrollToPoint(undefined,0,t)}async scrollToBottom(t=0){const o=await this.getScrollElement();const i=o.scrollHeight-o.clientHeight;return this.scrollToPoint(undefined,i,t)}async scrollByPoint(t,o,i){const s=await this.getScrollElement();return this.scrollToPoint(t+s.scrollLeft,o+s.scrollTop,i)}async scrollToPoint(t,o,i=0){const s=await this.getScrollElement();if(i<32){if(o!=null){s.scrollTop=o}if(t!=null){s.scrollLeft=t}return}let n;let e=0;const r=new Promise((t=>n=t));const l=s.scrollTop;const a=s.scrollLeft;const c=o!=null?o-l:0;const h=t!=null?t-a:0;const d=t=>{const o=Math.min(1,(t-e)/i)-1;const r=Math.pow(o,3)+1;if(c!==0){s.scrollTop=Math.floor(r*c+l)}if(h!==0){s.scrollLeft=Math.floor(r*h+a)}if(r<1){requestAnimationFrame(d)}else{n()}};requestAnimationFrame((t=>{e=t;d(t)}));return r}onScrollStart(){this.isScrolling=true;this.ionScrollStart.emit({isScrolling:true});if(this.watchDog){clearInterval(this.watchDog)}this.watchDog=setInterval((()=>{if(this.lastScroll<Date.now()-120){this.onScrollEnd()}}),100)}onScrollEnd(){if(this.watchDog)clearInterval(this.watchDog);this.watchDog=null;if(this.isScrolling){this.isScrolling=false;this.ionScrollEnd.emit({isScrolling:false})}}render(){const{isMainContent:t,scrollX:o,scrollY:i,el:s}=this;const r=h(s)?"rtl":"ltr";const a=l(this);const c=this.shouldForceOverscroll();const p=a==="ios";const g=t?"main":"div";this.resize();return n(e,{class:d(this.color,{[a]:true,"content-sizing":f("ion-popover",this.el),overscroll:c,[`content-${r}`]:true}),style:{"--offset-top":`${this.cTop}px`,"--offset-bottom":`${this.cBottom}px`}},n("div",{ref:t=>this.backgroundContentEl=t,id:"background-content",part:"background"}),n(g,{class:{"inner-scroll":true,"scroll-x":o,"scroll-y":i,overscroll:(o||i)&&c},ref:t=>this.scrollEl=t,onScroll:this.scrollEvents?t=>this.onScroll(t):undefined,part:"scroll"},n("slot",null)),p?n("div",{class:"transition-effect"},n("div",{class:"transition-cover"}),n("div",{class:"transition-shadow"})):null,n("slot",{name:"fixed"}))}get el(){return r(this)}};const u=t=>{var o;if(t.parentElement){return t.parentElement}if((o=t.parentNode)===null||o===void 0?void 0:o.host){return t.parentNode.host}return null};const v=t=>{const o=t.closest("ion-tabs");if(o){return o}const i=t.closest("ion-app, ion-page, .ion-page, page-inner, .popover-content");if(i){return i}return u(t)};const b=(t,o,i,s)=>{const n=t.currentX;const e=t.currentY;const r=t.currentTime;const l=o.scrollLeft;const a=o.scrollTop;const c=i-r;if(s){t.startTime=i;t.startX=l;t.startY=a;t.velocityX=t.velocityY=0}t.currentTime=i;t.currentX=t.scrollLeft=l;t.currentY=t.scrollTop=a;t.deltaX=l-t.startX;t.deltaY=a-t.startY;if(c>0&&c<100){const o=(l-n)/c;const i=(a-e)/c;t.velocityX=o*.7+t.velocityX*.3;t.velocityY=i*.7+t.velocityY*.3}};g.style=p;export{g as ion_content};
//# sourceMappingURL=p-631f215b.entry.js.map