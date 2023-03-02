import{r as i,h as r,d as s,H as t}from"./p-c36f36fa.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const e=(i,r,s,t,e)=>{const n=i.closest("ion-nav");if(n){if(r==="forward"){if(s!==undefined){return n.push(s,t,{skipIfBusy:true,animationBuilder:e})}}else if(r==="root"){if(s!==undefined){return n.setRoot(s,t,{skipIfBusy:true,animationBuilder:e})}}else if(r==="back"){return n.pop({skipIfBusy:true,animationBuilder:e})}}return Promise.resolve(false)};const n=class{constructor(r){i(this,r);this.routerDirection="forward";this.onClick=()=>e(this.el,this.routerDirection,this.component,this.componentProps,this.routerAnimation)}render(){return r(t,{onClick:this.onClick})}get el(){return s(this)}};export{n as ion_nav_link};
//# sourceMappingURL=p-51048c34.entry.js.map