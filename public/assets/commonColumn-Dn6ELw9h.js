import{j as e,M as r}from"./createReactComponent-CTa0ICdI.js";import{b as l}from"./index.tags-BMl43ewZ.js";import{t as c}from"./dateFormating-b7MTPZXO.js";import{v as i,K as d}from"./app-B_Z13nOW.js";import{I as h}from"./IconTrash-B1u9iJqt.js";import{I as n}from"./IconExternalLink-C9IKUlwJ.js";import{I as p,B as m}from"./icon-white-DmkG9gB2.js";const o=d(),t=d(),f=(a,u)=>[o.accessor("name",{header:"Nama",cell:s=>s.getValue()}),o.accessor("isUptodate",{header:"Status",cell:s=>e.jsx(l,{value:s.getValue()})}),o.accessor("joinedAt",{header:"Bergabung Pada",cell:s=>c(s.getValue())}),o.accessor("nodeId",{header:"Aksi",cell:s=>e.jsxs(r,{children:[a!=="gov"&&e.jsx(p,{colorScheme:"red",size:"sm",icon:e.jsx(h,{size:"16"}),"aria-label":"Hapus Node",onClick:()=>u(s.getValue())}),e.jsx(i,{to:"/nodes/"+s.getValue(),children:e.jsx(m,{colorScheme:"blue",size:"sm",leftIcon:e.jsx(n,{size:"16"}),"aria-label":"Lihat Node",children:"Lihat Node"})})]})})],V=()=>[t.accessor("name",{header:"Nama",cell:a=>a.getValue()}),t.accessor("isUptodate",{header:"Status",cell:a=>e.jsx(l,{value:a.getValue()})}),t.accessor("createdAt",{header:"Dibuat Pada",cell:a=>c(a.getValue())}),t.display({header:"Aksi",cell:a=>e.jsx(r,{children:e.jsx(i,{to:"/nodes/"+a.row.original.nodeId,children:e.jsx(m,{colorScheme:"blue",size:"sm",leftIcon:e.jsx(n,{size:"16"}),"aria-label":"Lihat Node",children:"Lihat Node"})})})})];export{V as a,f as g};
