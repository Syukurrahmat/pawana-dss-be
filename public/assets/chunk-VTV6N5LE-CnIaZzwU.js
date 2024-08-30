import{g as ce,m as Z}from"./icon-white-DqAPk9SI.js";import{h as A,r as n,aa as K,k as le,e as a,g as l,f as de,d as ue,o as fe,j as g,b as I,a as be}from"./createReactComponent-FtTA4e6D.js";import{a3 as he}from"./app-CLYuP7ne.js";var ke={border:"0",clip:"rect(0, 0, 0, 0)",height:"1px",width:"1px",margin:"-1px",padding:"0",overflow:"hidden",whiteSpace:"nowrap",position:"absolute"};function me(f,h=[]){const t=Object.assign({},f);for(const s of h)s in t&&delete t[s];return t}function ve(f={}){const h=ce(f),{isDisabled:t,isReadOnly:s,isRequired:k,isInvalid:o,id:p,onBlur:L,onFocus:M,"aria-describedby":C}=h,{defaultChecked:S,isChecked:w,isFocusable:R,onChange:E,isIndeterminate:c,name:U,value:H,tabIndex:q=void 0,"aria-label":O,"aria-labelledby":V,"aria-invalid":F,...$}=f,B=me($,["isDisabled","isReadOnly","isRequired","isInvalid","id","onBlur","onFocus","aria-describedby"]),j=A(E),z=A(L),T=A(M),[x,ee]=n.useState(!1),[b,P]=n.useState(!1),[v,G]=n.useState(!1),[y,m]=n.useState(!1);n.useEffect(()=>he(ee),[]);const d=n.useRef(null),[J,ae]=n.useState(!0),[te,_]=n.useState(!!S),N=w!==void 0,r=N?w:te,Q=n.useCallback(e=>{if(s||t){e.preventDefault();return}N||_(r?e.target.checked:c?!0:e.target.checked),j==null||j(e)},[s,t,r,N,c,j]);K(()=>{d.current&&(d.current.indeterminate=!!c)},[c]),le(()=>{t&&P(!1)},[t,P]),K(()=>{const e=d.current;if(!(e!=null&&e.form))return;const i=()=>{_(!!S)};return e.form.addEventListener("reset",i),()=>{var u;return(u=e.form)==null?void 0:u.removeEventListener("reset",i)}},[]);const W=t&&!R,X=n.useCallback(e=>{e.key===" "&&m(!0)},[m]),Y=n.useCallback(e=>{e.key===" "&&m(!1)},[m]);K(()=>{if(!d.current)return;d.current.checked!==r&&_(d.current.checked)},[d.current]);const se=n.useCallback((e={},i=null)=>{const u=D=>{b&&D.preventDefault(),m(!0)};return{...e,ref:i,"data-active":a(y),"data-hover":a(v),"data-checked":a(r),"data-focus":a(b),"data-focus-visible":a(b&&x),"data-indeterminate":a(c),"data-disabled":a(t),"data-invalid":a(o),"data-readonly":a(s),"aria-hidden":!0,onMouseDown:l(e.onMouseDown,u),onMouseUp:l(e.onMouseUp,()=>m(!1)),onMouseEnter:l(e.onMouseEnter,()=>G(!0)),onMouseLeave:l(e.onMouseLeave,()=>G(!1))}},[y,r,t,b,x,v,c,o,s]),ne=n.useCallback((e={},i=null)=>({...e,ref:i,"data-active":a(y),"data-hover":a(v),"data-checked":a(r),"data-focus":a(b),"data-focus-visible":a(b&&x),"data-indeterminate":a(c),"data-disabled":a(t),"data-invalid":a(o),"data-readonly":a(s)}),[y,r,t,b,x,v,c,o,s]),oe=n.useCallback((e={},i=null)=>({...B,...e,ref:Z(i,u=>{u&&ae(u.tagName==="LABEL")}),onClick:l(e.onClick,()=>{var u;J||((u=d.current)==null||u.click(),requestAnimationFrame(()=>{var D;(D=d.current)==null||D.focus({preventScroll:!0})}))}),"data-disabled":a(t),"data-checked":a(r),"data-invalid":a(o)}),[B,t,r,o,J]),re=n.useCallback((e={},i=null)=>({...e,ref:Z(d,i),type:"checkbox",name:U,value:H,id:p,tabIndex:q,onChange:l(e.onChange,Q),onBlur:l(e.onBlur,z,()=>P(!1)),onFocus:l(e.onFocus,T,()=>P(!0)),onKeyDown:l(e.onKeyDown,X),onKeyUp:l(e.onKeyUp,Y),required:k,checked:r,disabled:W,readOnly:s,"aria-label":O,"aria-labelledby":V,"aria-invalid":F?!!F:o,"aria-describedby":C,"aria-disabled":t,style:ke}),[U,H,p,Q,z,T,X,Y,k,r,W,s,O,V,F,o,C,t,q]),ie=n.useCallback((e={},i=null)=>({...e,ref:i,onMouseDown:l(e.onMouseDown,ye),"data-disabled":a(t),"data-checked":a(r),"data-invalid":a(o)}),[r,t,o]);return{state:{isInvalid:o,isFocused:b,isChecked:r,isActive:y,isHovered:v,isIndeterminate:c,isDisabled:t,isReadOnly:s,isRequired:k},getRootProps:oe,getCheckboxProps:se,getIndicatorProps:ne,getInputProps:re,getLabelProps:ie,htmlProps:B}}function ye(f){f.preventDefault(),f.stopPropagation()}var ge=de(function(h,t){const s=ue("Switch",h),{spacing:k="0.5rem",children:o,...p}=fe(h),{getIndicatorProps:L,getInputProps:M,getCheckboxProps:C,getRootProps:S,getLabelProps:w}=ve(p),R=n.useMemo(()=>({display:"inline-block",position:"relative",verticalAlign:"middle",lineHeight:0,...s.container}),[s.container]),E=n.useMemo(()=>({display:"inline-flex",flexShrink:0,justifyContent:"flex-start",boxSizing:"content-box",cursor:"pointer",...s.track}),[s.track]),c=n.useMemo(()=>({userSelect:"none",marginStart:k,...s.label}),[k,s.label]);return g.jsxs(I.label,{...S(),className:be("chakra-switch",h.className),__css:R,children:[g.jsx("input",{className:"chakra-switch__input",...M({},t)}),g.jsx(I.span,{...C(),className:"chakra-switch__track",__css:E,children:g.jsx(I.span,{__css:s.thumb,className:"chakra-switch__thumb",...L()})}),o&&g.jsx(I.span,{className:"chakra-switch__label",...w(),__css:c,children:o})]})});ge.displayName="Switch";export{ge as S};
