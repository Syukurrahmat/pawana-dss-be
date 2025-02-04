import{j as a,U as n,Y as i}from"./font-5Mxaz-3e.js";import{u as y,b as d,f as h,z as T,L as C,F as S,N as c,q as v,O as D,K as G,P as V,C as L,B as P,w as m,A as z,W as H,Q as M}from"./app-DYChiyhM.js";import{M as k}from"./index-BbXyb5rb.js";import{H as A}from"./HeadingWithIcon-BcaUOZuE.js";import{u as B,S as p}from"./useHashBasedTabsIndex-CRmJkRkw.js";import{t as W}from"./dateFormating-uitVsAGu.js";import{I as F}from"./IconPlus-CSH41dZv.js";import{I as N}from"./IconExternalLink-DW-fAtDQ.js";import{B as o}from"./logo-white-CsuGh6aO.js";import{G as U}from"./chunk-JARCRF6W-CSqiEFzw.js";import{T as E,a as O,b as x}from"./chunk-4YMKQ5D4-DA2V1YAZ.js";import{T as R,a as u}from"./chunk-IAXSQ4X2-D5Bt3YnL.js";import"./logo-Byq_-Epn.js";import"./TagWithIcon-D2AD1She.js";const s=M(),q=[s.accessor("name",{header:"Nama",cell:e=>a.jsxs(n,{spacing:"3",children:[a.jsx(L,{type:e.row.original.type}),a.jsx(i,{children:e.getValue()})]}),meta:{sortable:!0}}),s.accessor("type",{header:"Jenis ",cell:e=>a.jsx(P,{value:e.getValue()}),meta:{sortable:!0}}),s.accessor("address",{header:"Alamat",cell:e=>a.jsx(i,{noOfLines:2,whiteSpace:"wrap",children:e.getValue()})}),s.accessor("manager",{header:"Manager",cell:e=>a.jsx(m,{to:"../users/"+e.getValue().userId,children:a.jsx(o,{size:"sm",py:"5",variant:"outline",w:"full",justifyContent:"left",leftIcon:a.jsx(z,{size:"sm",name:e.getValue().name}),children:e.getValue().name})})}),s.accessor("createdAt",{header:"Dibuat pada",cell:e=>W(e.getValue()),meta:{sortable:!0}}),s.accessor("companyId",{header:"Aksi",cell:e=>a.jsx(m,{to:"/companies/"+e.getValue(),children:a.jsx(o,{colorScheme:"blue",size:"sm",leftIcon:a.jsx(N,{size:"16"}),children:"Detail"})})})];function la(){const[e,r]=B(["list","map"]),{roleIs:f}=y(),{data:t}=d("/companies/overview",h),j=T();return t?a.jsxs(S,{gap:"2",flexDir:"column",children:[a.jsxs(n,{w:"full",spacing:"4",align:"start",wrap:"wrap",children:[a.jsx(A,{Icon:a.jsx(c,{}),text:"Daftar Perusahaan"}),a.jsx(v,{flexGrow:"999"}),a.jsxs(n,{wrap:"wrap",justify:"end",flexBasis:"450px",flexGrow:"1",children:[a.jsx(D,{w:"225px",flex:"1 0 ",bg:"white",placeholder:"Cari ..",_onSubmit:null}),f("admin")&&a.jsx(o,{leftIcon:a.jsx(F,{size:"20px"}),colorScheme:"green",children:"Tambah Perusahaan",onClick:()=>j("./create")})]})]}),a.jsxs(U,{mt:"2",gap:"2",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",children:[a.jsx(p,{icon:c,count:t.all,label:"Total Perusahaan",variant:"solid"}),t.type.map((l,g)=>{const{color:w,name:b,icon:I}=G[l.value];return a.jsx(p,{h:"100%",icon:I,count:l.count,label:b,color:w},g)})]}),a.jsxs(E,{display:"flex",flexDir:"column",flexGrow:"1",index:e,onChange:r,isLazy:!0,children:[a.jsxs(R,{flexWrap:"wrap",rowGap:"4px",children:[a.jsx(u,{children:"Daftar Perusahaan"}),a.jsx(u,{children:"Lihat Dalam Maps"})]}),a.jsxs(O,{flexGrow:"1",children:[a.jsx(x,{px:"0",children:a.jsx(V,{flexGrow:"1",apiUrl:"/companies",columns:q})}),a.jsx(x,{px:"0",pb:"0",flexGrow:"1",children:a.jsx(J,{})})]})]})]}):a.jsx(C,{})}function J(){const{data:e}=d("/companies?all=true",h),r="450px";return e?a.jsx(k,{h:r,scrollWheelZoom:!1,data:e.rows}):a.jsx(H,{h:r,rounded:"md"})}export{la as default};
