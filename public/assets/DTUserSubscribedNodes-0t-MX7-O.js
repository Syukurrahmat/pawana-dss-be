import{r,j as e,L as f}from"./createReactComponent-FtTA4e6D.js";import{D as g,u as x,N as h,H as N,m as C,e as D}from"./app-CLYuP7ne.js";import{g as k}from"./commonColumn-BHULZb4N.js";import{M as y}from"./index-C6zMlMRi.js";import{u as U}from"./common.utils-kkfCXngb.js";function R({data:i,mutate:a,...u}){const[t,m]=r.useState(null),o=U(),d=g(),{user:c}=x(),s=`/users/${i.userId}/nodes`,l=b=>{d({title:"Hapus Pengikuti Node",message:"Anda yakin hendak menghapus node ini dari daftar langganan",confirmButtonColor:"red",onConfirm:()=>C.delete(`${s}/${b}`).then(()=>{o.success("Node berhasil di-unsubcribe"),D(n=>typeof n=="string"&&n.startsWith(s)),a&&a()}).catch(()=>{o.success("Node berhasil di-unsubcribe")})})},p=r.useMemo(()=>k(c.role,l),[]);return e.jsxs(f,{...u,children:[e.jsx(y,{data:t||[],as:t==null?h:void 0}),e.jsx(N,{mt:"4",apiUrl:s,columns:p,setDataContext:m,emptyMsg:["Belum ada Node","Tambahkan Node sekarang"],hiddenPagination:!0})]})}export{R as U};
