import{r as t,e as i,h as s,H as e,d as r}from"./p-c36f36fa.js";import{g as n}from"./p-c57c31a3.js";import{d as o}from"./p-f08587bc.js";const h=":host{display:block;object-fit:contain}img{display:block;width:100%;height:100%;object-fit:inherit;object-position:inherit}";const a=class{constructor(s){t(this,s);this.ionImgWillLoad=i(this,"ionImgWillLoad",7);this.ionImgDidLoad=i(this,"ionImgDidLoad",7);this.ionError=i(this,"ionError",7);this.inheritedAttributes={};this.onLoad=()=>{this.ionImgDidLoad.emit()};this.onError=()=>{this.ionError.emit()}}srcChanged(){this.addIO()}componentWillLoad(){this.inheritedAttributes=o(this.el,["draggable"])}componentDidLoad(){this.addIO()}addIO(){if(this.src===undefined){return}if(typeof window!=="undefined"&&"IntersectionObserver"in window&&"IntersectionObserverEntry"in window&&"isIntersecting"in window.IntersectionObserverEntry.prototype){this.removeIO();this.io=new IntersectionObserver((t=>{if(t[t.length-1].isIntersecting){this.load();this.removeIO()}}));this.io.observe(this.el)}else{setTimeout((()=>this.load()),200)}}load(){this.loadError=this.onError;this.loadSrc=this.src;this.ionImgWillLoad.emit()}removeIO(){if(this.io){this.io.disconnect();this.io=undefined}}render(){const{loadSrc:t,alt:i,onLoad:r,loadError:o,inheritedAttributes:h}=this;const{draggable:a}=h;return s(e,{class:n(this)},s("img",{decoding:"async",src:t,alt:i,onLoad:r,onError:o,part:"image",draggable:d(a)}))}get el(){return r(this)}static get watchers(){return{src:["srcChanged"]}}};const d=t=>{switch(t){case"true":return true;case"false":return false;default:return undefined}};a.style=h;export{a as ion_img};
//# sourceMappingURL=p-8b50c0f6.entry.js.map