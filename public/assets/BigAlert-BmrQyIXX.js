import{L as i,j as e,a7 as x,a8 as h,ab as p,a9 as u,M as m}from"./createReactComponent-CTa0ICdI.js";import{W as d,I as j,v}from"./app-B_Z13nOW.js";import{I as f}from"./IconCirclePlus-1c9aJlrm.js";import{B as t}from"./icon-white-DmkG9gB2.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var I=i("outline","layout-navbar-expand","IconLayoutNavbarExpand",[["path",{d:"M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z",key:"svg-0"}],["path",{d:"M4 9h16",key:"svg-1"}],["path",{d:"M10 14l2 2l2 -2",key:"svg-2"}]]);const S=({title:l,description:r,detailPageURL:a,onCreateAgain:n,itemName:s,...o})=>{const c=d();return e.jsxs(x,{mt:"10",px:"6",py:"10",rounded:"lg",variant:"subtle",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:"2",...o,children:[e.jsx(h,{boxSize:"50px",mr:0}),e.jsx(p,{fontSize:"xl",children:l}),e.jsx(u,{maxW:"lg",whiteSpace:"pre-line",children:r}),e.jsxs(m,{mt:"4",children:[e.jsx(t,{leftIcon:e.jsx(j,{size:"20"}),colorScheme:"blue",variant:"outline",children:"Kembali",onClick:()=>c(-1)}),e.jsx(t,{leftIcon:e.jsx(f,{size:"20"}),colorScheme:"blue",children:"Buat lagi",onClick:n}),!!a&&!!s&&o.status==="success"&&e.jsx(v,{to:a,children:e.jsx(t,{leftIcon:e.jsx(I,{size:"20"}),colorScheme:"blue",children:"Lihat "+s,onClick:n})})]})]})};export{S as B};
