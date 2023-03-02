import{r as t,e as s,w as e,h as i,H as n,d as o}from"./p-c36f36fa.js";import{c as r,g as a}from"./p-c57c31a3.js";import{p as h}from"./p-f08587bc.js";import{i as c}from"./p-506221fe.js";import{c as l,h as u}from"./p-0e4de1d0.js";const d=":host{--ripple-color:currentColor;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:flex;position:relative;align-items:stretch;justify-content:center;width:100%;background:var(--background);font-family:var(--ion-font-family, inherit);text-align:center;contain:paint;user-select:none}:host(.segment-scrollable){justify-content:start;width:auto;overflow-x:auto}:host(.segment-scrollable::-webkit-scrollbar){display:none}:host{--background:rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.065);border-radius:8px;overflow:hidden;z-index:0}:host(.ion-color){background:rgba(var(--ion-color-base-rgb), 0.065)}:host(.in-toolbar){margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;width:auto}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){:host(.in-toolbar){margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}:host(.in-toolbar:not(.ion-color)){background:var(--ion-toolbar-segment-background, var(--background))}:host(.in-toolbar-color:not(.ion-color)){background:rgba(var(--ion-color-contrast-rgb), 0.11)}";const f=":host{--ripple-color:currentColor;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:flex;position:relative;align-items:stretch;justify-content:center;width:100%;background:var(--background);font-family:var(--ion-font-family, inherit);text-align:center;contain:paint;user-select:none}:host(.segment-scrollable){justify-content:start;width:auto;overflow-x:auto}:host(.segment-scrollable::-webkit-scrollbar){display:none}:host{--background:transparent}:host(.in-toolbar){min-height:var(--min-height)}:host(.segment-scrollable) ::slotted(ion-segment-button){min-width:auto}";const g=class{constructor(e){t(this,e);this.ionChange=s(this,"ionChange",7);this.ionSelect=s(this,"ionSelect",7);this.ionStyle=s(this,"ionStyle",7);this.didInit=false;this.activated=false;this.disabled=false;this.scrollable=false;this.swipeGesture=true;this.selectOnFocus=false;this.onClick=t=>{const s=t.target;const e=this.checked;if(s.tagName==="ION-SEGMENT"){return}this.value=s.value;if(this.scrollable||!this.swipeGesture){if(e){this.checkButton(e,s)}else{this.setCheckedClasses()}}this.checked=s};this.getSegmentButton=t=>{var s,e;const i=this.getButtons().filter((t=>!t.disabled));const n=i.findIndex((t=>t===document.activeElement));switch(t){case"first":return i[0];case"last":return i[i.length-1];case"next":return(s=i[n+1])!==null&&s!==void 0?s:i[0];case"previous":return(e=i[n-1])!==null&&e!==void 0?e:i[i.length-1];default:return null}}}colorChanged(t,s){if(s===undefined&&t!==undefined||s!==undefined&&t===undefined){this.emitStyle()}}swipeGestureChanged(){this.gestureChanged()}valueChanged(t,s){this.ionSelect.emit({value:t});if(s!==""||this.didInit){if(!this.activated){this.ionChange.emit({value:t})}else{this.valueAfterGesture=t}}if(this.scrollable){const s=this.getButtons();const e=s.find((s=>s.value===t));if(e!==undefined){e.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"})}}}disabledChanged(){this.gestureChanged();const t=this.getButtons();for(const s of t){s.disabled=this.disabled}}gestureChanged(){if(this.gesture){this.gesture.enable(!this.scrollable&&!this.disabled&&this.swipeGesture)}}connectedCallback(){this.emitStyle()}componentWillLoad(){this.emitStyle()}async componentDidLoad(){this.setCheckedClasses();this.gesture=(await import("./p-0b857c77.js")).createGesture({el:this.el,gestureName:"segment",gesturePriority:100,threshold:0,passive:false,onStart:t=>this.onStart(t),onMove:t=>this.onMove(t),onEnd:t=>this.onEnd(t)});this.gestureChanged();if(this.disabled){this.disabledChanged()}this.didInit=true}onStart(t){this.activate(t)}onMove(t){this.setNextIndex(t)}onEnd(t){this.setActivated(false);const s=this.setNextIndex(t,true);t.event.stopImmediatePropagation();if(s){this.addRipple(t)}const e=this.valueAfterGesture;if(e!==undefined){this.ionChange.emit({value:e});this.valueAfterGesture=undefined}}getButtons(){return Array.from(this.el.querySelectorAll("ion-segment-button"))}addRipple(t){const s=r.getBoolean("animated",true)&&r.getBoolean("rippleEffect",true);if(!s){return}const e=this.getButtons();const i=e.find((t=>t.value===this.value));const n=i.shadowRoot||i;const o=n.querySelector("ion-ripple-effect");if(!o){return}const{x:a,y:c}=h(t.event);o.addRipple(a,c).then((t=>t()))}setActivated(t){const s=this.getButtons();s.forEach((s=>{if(t){s.classList.add("segment-button-activated")}else{s.classList.remove("segment-button-activated")}}));this.activated=t}activate(t){const s=t.event.target;const e=this.getButtons();const i=e.find((t=>t.value===this.value));if(s.tagName!=="ION-SEGMENT-BUTTON"){return}if(!i){this.value=s.value;this.setCheckedClasses()}if(this.value===s.value){this.setActivated(true)}}getIndicator(t){const s=t.shadowRoot||t;return s.querySelector(".segment-button-indicator")}checkButton(t,s){const i=this.getIndicator(t);const n=this.getIndicator(s);if(i===null||n===null){return}const o=i.getBoundingClientRect();const r=n.getBoundingClientRect();const a=o.width/r.width;const h=o.left-r.left;const c=`translate3d(${h}px, 0, 0) scaleX(${a})`;e((()=>{n.classList.remove("segment-button-indicator-animated");n.style.setProperty("transform",c);n.getBoundingClientRect();n.classList.add("segment-button-indicator-animated");n.style.setProperty("transform","")}));this.value=s.value;this.setCheckedClasses()}setCheckedClasses(){const t=this.getButtons();const s=t.findIndex((t=>t.value===this.value));const e=s+1;this.checked=t.find((t=>t.value===this.value));for(const s of t){s.classList.remove("segment-button-after-checked")}if(e<t.length){t[e].classList.add("segment-button-after-checked")}}setNextIndex(t,s=false){const e=c(this.el);const i=this.activated;const n=this.getButtons();const o=n.findIndex((t=>t.value===this.value));const r=n[o];let a;let h;if(o===-1){return}const l=r.getBoundingClientRect();const u=l.left;const d=l.width;const f=t.currentX;const g=l.top+l.height/2;const m=this.el.getRootNode();const b=m.elementFromPoint(f,g);const p=e?f>u+d:f<u;const v=e?f<u:f>u+d;if(i&&!s){if(p){const t=o-1;if(t>=0){h=t}}else if(v){if(i&&!s){const t=o+1;if(t<n.length){h=t}}}if(h!==undefined&&!n[h].disabled){a=n[h]}}if(!i&&s){a=b}if(a!=null){if(a.tagName==="ION-SEGMENT"){return false}if(r!==a){this.checkButton(r,a)}}return true}emitStyle(){this.ionStyle.emit({segment:true})}onKeyDown(t){const s=c(this.el);let e=this.selectOnFocus;let i;switch(t.key){case"ArrowRight":t.preventDefault();i=s?this.getSegmentButton("previous"):this.getSegmentButton("next");break;case"ArrowLeft":t.preventDefault();i=s?this.getSegmentButton("next"):this.getSegmentButton("previous");break;case"Home":t.preventDefault();i=this.getSegmentButton("first");break;case"End":t.preventDefault();i=this.getSegmentButton("last");break;case" ":case"Enter":t.preventDefault();i=document.activeElement;e=true}if(!i){return}if(e){const t=this.checked||i;this.checkButton(t,i)}i.setFocus()}render(){const t=a(this);return i(n,{role:"tablist",onClick:this.onClick,class:l(this.color,{[t]:true,"in-toolbar":u("ion-toolbar",this.el),"in-toolbar-color":u("ion-toolbar[color]",this.el),"segment-activated":this.activated,"segment-disabled":this.disabled,"segment-scrollable":this.scrollable})},i("slot",null))}get el(){return o(this)}static get watchers(){return{color:["colorChanged"],swipeGesture:["swipeGestureChanged"],value:["valueChanged"],disabled:["disabledChanged"]}}};g.style={ios:d,md:f};export{g as ion_segment};
//# sourceMappingURL=p-116a9062.entry.js.map