import{K as R,j as e,H as i,F as W,L as f,N as m,J as D,V as j,T as t,r as fe,C as P,a8 as ie,a3 as ye,a9 as be,I as Se}from"./createReactComponent-m2GCamtz.js";import{y as ve,u as V,C as Ce,z as B,r as C,A as Ie,v as De,B as Te,j as N,D as ke,k as ze,p as Me,L as Pe}from"./app-BlQRCkbL.js";import{C as we,D as Ae,S as Ue}from"./informationCard-CoG_vFyO.js";import{I as le}from"./IconNotebookOff-DN5RGc3R.js";import{C as H,a as G,b as F}from"./chunk-YQO7BFFX-BRJMp5Lc.js";import{T,t as We}from"./dateFormating-CjiM6gKV.js";import{M as Ne,N as He,V as Fe}from"./index-Dt6lv0Jl.js";import{a as Le}from"./index.tags-vBYpzwqj.js";import{T as ae}from"./TagWithIcon-BmQxVHBm.js";import{g as L,b as E,d as Y}from"./common.utils-BXgvsAbj.js";import{I as Ke}from"./IconCalendar-DeQmHFDN.js";import{F as w}from"./chunk-KRPLQIP4-1nj_ibqy.js";import{a as Oe}from"./ReportCard-70O10eF9.js";import{A as se}from"./AddNodeSubscription-CF30erQV.js";import{d as de,T as ce,M as xe,a as ue,b as he,c as ne,S as je,U as Ee}from"./ISPUChart-DIqr_YYN.js";import{M as A}from"./MyLineChart-DYDC_vRb.js";import{T as _,a as $,b as k,c as X,d as U}from"./chunk-IAXSQ4X2-BWbuaJl8.js";import{I as Ye,a as re}from"./IconTrees-B9fr_ohZ.js";import{I as te}from"./IconCirclePlus-D9W8Q483.js";import"./useApiResponseToast-CR3ZylCY.js";import"./IconMapPin-CWtp4fMu.js";import"./index-B4MCLp8v.js";import"./IconTrash-CmToVWU0.js";import"./IconEdit-DHHo-74T.js";import"./chunk-4FCEGNGT-DqvOsicM.js";import"./IconPlus-Bm6anzmS.js";import"./chunk-V7PAE35Z-BuEgg6Tf.js";import"./index-CH91JLn2.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var Re=R("outline","circle-x","IconCircleX",[["path",{d:"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M10 10l4 4m0 -4l-4 4",key:"svg-1"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var K=R("outline","history","IconHistory",[["path",{d:"M12 8l0 4l2 2",key:"svg-0"}],["path",{d:"M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5",key:"svg-1"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ve=R("outline","receipt","IconReceipt",[["path",{d:"M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2m4 -14h6m-6 4h6m-2 4h2",key:"svg-0"}]]);function Be({data:o,...l}){return e.jsxs(H,{...l,children:[e.jsxs(G,{pb:"0",as:i,children:[e.jsx(W,{border:"2px solid",borderColor:"orange.200",color:"orange.500",rounded:"md",p:"1",boxSize:"45px",children:e.jsx(f,{as:ve,boxSize:"28px"})}),e.jsxs(m,{ml:"1",children:[e.jsx(D,{size:"md",children:"Kegiatan terkini"}),e.jsxs(T,{mt:"1",children:[o.length," Kegiatan Terkini"]})]})]}),e.jsx(F,{children:e.jsx(j,{align:"stretch",children:o.length?e.jsx(e.Fragment,{children:o.map(a=>e.jsx(we,{event:a},a.eventLogId))}):e.jsxs(i,{justify:"center",color:"gray.500",py:"3",children:[e.jsx(le,{stroke:"1.2",size:"40"}),e.jsx(t,{fontWeight:"500",fontSize:"lg",children:"Tidak ada Kegiatan Berlangsung"})]})})})]})}function Ge({data:o}){const{dashboardInfo:l,nodes:a}=o,{name:s,type:r,coordinate:n,countNodes:d,companyId:c,createdAt:x}=l,[h,p]=fe.useState(null),{roleIsNot:b}=V(),v=(S="outdoor")=>{var I,M,q,J,Z;return[{name:"ISPU",currentData:(I=a[S])==null?void 0:I.map(u=>{var ee;const g=(ee=u.latestData)==null?void 0:ee.ispu;if(!g)return{...u,data:{name:"ISPU"}};const{datetime:z,value:Q}=g;if(!Q[0])return{...u,data:{name:"ISPU"}};const{ispu:me,category:ge}=Q[0];return{...u,data:{name:"ISPU",datetime:z,value:me,color:L(ge).colorScheme}}})},{name:"PM2.5",currentData:(M=a[S])==null?void 0:M.map(u=>{var g;return{...u,data:{name:"PM2.5",...(g=u.latestData)==null?void 0:g.pm25}}})},{name:"PM10",currentData:(q=a[S])==null?void 0:q.map(u=>{var g;return{...u,data:{name:"PM10",...(g=u.latestData)==null?void 0:g.pm100}}})},{name:"CH4",currentData:(J=a[S])==null?void 0:J.map(u=>{if(!u.latestData)return{...u,data:{name:"CH4"}};const{datetime:g,value:z}=u.latestData.ch4;return{...u,data:{name:"CH4",datetime:g,value:z.value,color:""}}})},{name:"CO2",currentData:(Z=a[S])==null?void 0:Z.map(u=>{if(!u.latestData)return{...u,data:{name:"CO2"}};const{datetime:g,value:z}=u.latestData.co2;return{...u,data:{name:"CO2",datetime:g,value:z.value,color:""}}})}]},O={name:s,type:r,coordinate:n,companyId:c,indoorNodeValue:h!==null?v("indoor")[h].currentData:null},y=h!==null?v()[h].currentData:a.outdoor;return r=="regular"&&d==0?null:e.jsx(H,{size:"sm",w:"full",children:e.jsxs(F,{as:w,gap:"5",children:[e.jsx(Ne,{w:"60%",h:"275px",companiesData:c?[O]:[],marker:h===null?He:Fe,data:y||[]}),e.jsxs(j,{align:"start",p:"1",flexGrow:"1",children:[e.jsxs(i,{mt:"6",children:[e.jsx(Ce,{type:r}),e.jsx(D,{size:"md",fontWeight:"600",children:s})]}),e.jsxs(i,{mt:"2",children:[!!x&&e.jsx(e.Fragment,{children:e.jsx(ae,{icon:Ke,colorScheme:"blue",children:`Dibuat pada ${We(x)}`})}),r!=="regular"&&e.jsx(Le,{value:r}),e.jsx(ae,{icon:B,children:d+" Node"})]}),e.jsx(C,{}),e.jsxs(m,{children:[e.jsx(t,{children:"Tampilkan nilai dari parameter : "}),e.jsx(w,{flexWrap:"wrap",gap:"3",mt:"1",children:v().map((S,I)=>e.jsx(P,{size:"sm",colorScheme:"teal",border:"1px solid",borderColor:"teal.500",variant:h==I?"solid":"outline",onClick:()=>p(M=>M!=I?I:null),children:S.name},I))})]}),e.jsxs(i,{justify:"end",w:"full",mt:"4",children:[b("regular")&&e.jsx(Ie,{colorScheme:"blue",children:"Ganti Dashboard"}),!!c&&e.jsx(De,{to:`/companies/${c}`,children:e.jsx(P,{colorScheme:"blue",ml:"2",children:"Detail Usaha"})})]})]})]})})}function _e({data:o,...l}){return e.jsxs(H,{...l,children:[e.jsxs(G,{pb:"0",as:i,children:[e.jsx(W,{border:"2px solid",borderColor:"yellow.200",color:"yellow.500",rounded:"md",p:"1",boxSize:"45px",children:e.jsx(f,{as:Te,boxSize:"28px"})}),e.jsxs(m,{ml:"1",children:[e.jsx(D,{size:"md",children:"Aduan terkini"}),e.jsxs(T,{mt:"1",children:[o.length," Aduan terkini"]})]})]}),e.jsxs(F,{children:[e.jsx(t,{mb:"4",children:"Aduan dalam radius 250 meter dari lokasi usaha Anda dalam 24 jam terakhir"}),e.jsx(j,{align:"stretch",children:o.length?o.map(a=>e.jsx(Oe,{border:"1px solid",rounded:"lg",borderColor:"gray.200",size:"sm",data:a},a.reportId)):e.jsxs(i,{justify:"center",color:"gray.500",py:"3",children:[e.jsx(le,{stroke:"1.2",size:"40"}),e.jsx(t,{fontWeight:"500",fontSize:"lg",children:"Tidak ada Aduan di sekitar"})]})})]})]})}const $e="/assets/opss-BHGvqmEc.png";function Xe({CH4data:o,CO2data:l}){const a=[{symbol:"CH4",name:"Metana",threshold:ce,max:xe,data:o},{symbol:"CO2",name:"Karbondioksida",max:ue,threshold:he,data:l}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{w:"full",justify:"space-evenly",px:"2",py:"3",border:"1px solid",borderColor:"gray.300",rounded:"5",children:a.map(({symbol:s,name:r,threshold:n,data:d,max:c},x)=>{const{value:h,category:p}=d.average.data.value,{colorScheme:b}=s=="CO2"?E(p):Y(p);return e.jsxs(j,{spacing:"1",h:"86px",children:[e.jsxs(i,{color:"gray.600",alignSelf:"start",fontSize:"lg",spacing:"1",children:[e.jsxs(t,{fontWeight:"600",children:[s.slice(0,2),e.jsx("sub",{children:s[2]})]}),e.jsx(t,{fontWeight:"600",children:r})]}),e.jsxs(i,{children:[e.jsxs(m,{children:[e.jsx(t,{fontSize:"xl",fontWeight:"600",children:h+" PPM"}),e.jsx(T,{w:"full",fontSize:"md",justifyContent:"center",colorScheme:b,children:p})]}),e.jsx(de,{style:{width:"125px"},arcsLength:n,colors:["#5BE12C","#F5CD19","#EA4228"],percent:h/c,arcPadding:.02,hideText:!0})]})]},x)})}),e.jsx(i,{w:"full",children:a.map(({symbol:s,data:r},n)=>e.jsx(j,{flex:"1 1 0px",border:"1px solid",borderColor:"gray.300",rounded:"5",py:"2",px:"4",children:[r.highest,r.lowest].map(({name:d,data:{value:c}},x)=>e.jsxs(i,{spacing:"1",w:"full",justify:"space-between",children:[e.jsxs(m,{children:[e.jsxs(i,{color:"gray.700",spacing:"1",fontWeight:"600",children:[e.jsxs(t,{children:[s.slice(0,2),e.jsx("sub",{children:s[2]})]}),e.jsx(t,{children:x?"Terendah":"Tertinggi"})]}),e.jsx(i,{color:"gray.600",mt:"1",children:e.jsx(t,{fontSize:"sm",children:d})})]}),e.jsxs(j,{spacing:"0",children:[e.jsx(t,{fontSize:"lg",fontWeight:"600",children:c.value+" PPM"}),e.jsx(T,{fontSize:"md",w:"full",justifyContent:"center",colorScheme:(s=="CO2"?E(c.category):Y(c.category)).colorScheme,children:c.category})]})]},x))},n))}),e.jsx(C,{}),e.jsxs(i,{justify:"end",w:"full",children:[e.jsx(f,{as:K,boxSize:"18px"}),e.jsxs(t,{children:["Data diperbarui pada"," ",N(o.average.data.datetime).format("HH:mm DD MMM YYYY")]})]})]})}function qe({CO2data:o,CH4data:l}){const a=[{symbol:"CH4",name:"Metana",threshold:ce,max:xe,data:l},{symbol:"CO2",name:"Karbondioksida",max:ue,threshold:he,data:o}];return e.jsxs(e.Fragment,{children:[e.jsx(i,{w:"full",justify:"space-evenly",px:"2",h:"calc(168px + 1em)",border:"1px solid",borderColor:"gray.300",rounded:"5",children:a.map(({symbol:s,name:r,threshold:n,data:d,max:c},x)=>{const{value:h,category:p}=d.latestData.value,{colorScheme:b}=s=="CO2"?E(p):Y(p);return e.jsxs(j,{spacing:"1",children:[e.jsxs(i,{color:"gray.600",fontSize:"lg",children:[e.jsxs(t,{fontWeight:"700",children:[s.slice(0,2),e.jsx("sub",{children:s[2]})]}),e.jsx(t,{fontWeight:"500",children:r})]}),e.jsx(de,{style:{width:"125px"},arcsLength:n,colors:["#5BE12C","#F5CD19","#EA4228"],percent:h>c?1:h/c,arcPadding:.02,hideText:!0}),e.jsx(t,{fontSize:"2xl",fontWeight:"600",children:h+" PPM"}),e.jsx(T,{w:"full",fontSize:"md",py:"1",justifyContent:"center",colorScheme:b,children:p})]},x)})}),e.jsxs(_,{w:"full",children:[e.jsx($,{children:e.jsx(k,{_active:{bg:"initial"},children:"Tren Gas Emisi Rumah Kaca"})}),e.jsx(X,{children:e.jsxs(U,{children:[e.jsxs(m,{h:"110px",w:"full",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren Gas Metana (CH4)"}),e.jsx(A,{withoutLegend:!0,data:l.tren,dataKeyTypeAndFunc:{envType:"outdoor",func:s=>s.value.value}})]}),e.jsxs(m,{mt:"8",h:"110px",w:"full",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren Karbondioksida (CO2)"}),e.jsx(A,{withoutLegend:!0,data:o.tren,dataKeyTypeAndFunc:{envType:"outdoor",func:s=>s.value.value}})]})]})})]}),e.jsx(C,{}),e.jsxs(i,{justify:"end",w:"full",children:[e.jsx(f,{as:K,boxSize:"18px"}),e.jsxs(t,{children:["Data diperbarui pada"," ",N(l.latestData.datetime).format("HH:mm DD MMM YYYY")]})]})]})}function Je({data:o}){const{latestData:{datetime:l,value:a},tren:s}=o;return e.jsxs(e.Fragment,{children:[e.jsx(pe,{value:a[0]}),e.jsx(i,{justify:"space-evenly",w:"full",children:a.map((r,n)=>e.jsx(Ze,{value:r},n))}),e.jsxs(_,{w:"full",children:[e.jsxs($,{children:[e.jsx(k,{children:"Tren ISPU"}),e.jsx(k,{children:"Tren Pencemar"})]}),e.jsxs(X,{children:[e.jsxs(U,{px:"0",children:[e.jsxs(m,{h:"110px",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren ISPU PM2.5"}),e.jsx(ne,{withoutLegend:!0,data:s,dataKeyTypeAndFunc:{envType:"outdoor",func:r=>r.value.find(n=>n.pollutant=="PM25")}})]}),e.jsxs(m,{mt:"8",h:"110px",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren ISPU PM10"}),e.jsx(ne,{withoutLegend:!0,data:s,dataKeyTypeAndFunc:{envType:"outdoor",func:r=>r.value.find(n=>n.pollutant=="PM100")}})]})]}),e.jsxs(U,{px:"0",children:[e.jsxs(m,{h:"110px",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren Pencemar PM2.5"}),e.jsx(A,{withoutLegend:!0,data:s,dataKeyTypeAndFunc:{envType:"outdoor",func:r=>r.value.find(n=>n.pollutant=="PM25").pollutantValue}})]}),e.jsxs(m,{mt:"8",h:"110px",children:[e.jsx(t,{fontWeight:"600",mb:"2",children:"Tren Pencemar PM10"}),e.jsx(A,{withoutLegend:!0,data:s,dataKeyTypeAndFunc:{envType:"outdoor",func:r=>r.value.find(n=>n.pollutant=="PM100").pollutantValue}})]})]})]})]}),e.jsx(C,{}),e.jsxs(i,{justify:"end",w:"full",children:[e.jsx(f,{as:K,boxSize:"18px"}),e.jsxs(t,{children:["ISPU Pukul ",N(l).format("HH:mm DD MMM YYYY")]})]})]})}function Ze({value:o,...l}){const{category:a,ispu:s,pollutant:r,pollutantValue:n}=o,{colorScheme:d}=L(a);return e.jsxs(i,{as:w,bg:d+".100",py:"6px",h:"59px",px:"4",rounded:"md",spacing:"4",divider:e.jsx(je,{borderColor:d+".200"}),...l,children:[e.jsx(t,{fontSize:"xl",fontWeight:"600",children:r}),e.jsxs(m,{children:[e.jsx(t,{fontSize:"2xl",fontWeight:"600",children:s<=300?s:"300+"}),e.jsxs(t,{fontSize:"sm",children:[n.toFixed(2)," ",Ee]})]})]})}function pe({value:o,...l}){const{category:a,ispu:s,pollutant:r}=o,{colorScheme:n,icon:d}=L(a);return e.jsxs(i,{w:"full",spacing:"4",p:"2",bg:n+".100",rounded:"5",...l,children:[e.jsxs(j,{rounded:"3",align:"start",boxSize:"95px",p:"2",spacing:"0",bg:n+".200",children:[e.jsx(t,{fontStyle:"italic",children:"ISPU"}),e.jsx(C,{}),e.jsx(t,{textAlign:"center",w:"full",fontSize:"4xl",fontWeight:"700",children:s<=300?s:"300+"})]}),e.jsxs(j,{align:"start",spacing:"2",children:[e.jsx(D,{as:"p",size:"lg",children:a}),e.jsxs(T,{colorScheme:n,variant:"outline",children:["Polutan Utama : ",r]})]}),e.jsx(C,{}),e.jsx(f,{boxSize:"90px",strokeWidth:"1.5px",color:n+".400",as:d})]})}function Qe({data:o}){const{highest:l,lowest:a,average:s}=o,{value:r,datetime:n}=s.data;return e.jsxs(e.Fragment,{children:[e.jsx(pe,{value:r[0]}),e.jsx(ie,{direction:"row",spacing:"4",w:"full",justifyContent:"space-evenly",children:[l,a].map((d,c)=>e.jsx(ea,{data:d,label:c?"Terendah":"Tertinggi"},c))}),e.jsx(C,{}),e.jsxs(i,{justify:"end",w:"full",children:[e.jsx(f,{as:K,boxSize:"18px"}),e.jsxs(t,{children:["ISPU Pukul ",N(n).format("HH:mm DD MMM YYYY")]})]})]})}function ea({data:o,label:l}){const{category:a,ispu:s}=o.data.value[0],{colorScheme:r}=L(a);return e.jsxs(j,{minW:"200px",spacing:"0",rounded:"md",align:"start",px:"4",py:"3",justify:"center",bg:r+".100",children:[e.jsx(t,{fontWeight:"500",children:l}),e.jsxs(i,{w:"full",justify:"space-between",children:[e.jsx(t,{fontSize:"2xl",fontWeight:700,children:s<=300?s:"300+"}),e.jsx(T,{bg:r+".300",children:a})]}),e.jsxs(i,{spacing:"1",children:[e.jsx(B,{size:"16"}),e.jsx(t,{w:"full",noOfLines:1,fontSize:"sm",children:o.name})]})]})}const aa={indoor:{icon:Ye,color:"blue",title:"Kualitas Udara Di dalam ruangan"},outdoor:{icon:re,color:"green",title:"Kualitas Udara Di sekitar usaha Anda"},arround:{icon:re,color:"green",title:"Kualitas Udara Di sekitar Anda"}};function oe({data:o,type:l}){const{data:a,countNodes:s,analiysisDataType:r}=o,n=r=="single",d=s.all-s.active,{icon:c,color:x,title:h}=aa[l];return e.jsxs(H,{children:[e.jsx(G,{pb:"1",children:e.jsxs(i,{children:[e.jsx(W,{border:"2px solid",borderColor:x+".200",color:x+".500",rounded:"md",p:"1",boxSize:"45px",children:e.jsx(f,{as:c,boxSize:"28px"})}),e.jsxs(m,{children:[e.jsx(D,{size:"md",children:h}),!!a&&e.jsxs(i,{spacing:"4",children:[e.jsxs(i,{children:[e.jsx(f,{as:B}),e.jsx(t,{children:n?a.node.name:`Rerata dari ${s.active} sensor`})]}),!!d&&e.jsxs(i,{children:[e.jsx(f,{as:Re}),e.jsxs(t,{children:[d," Node Tidak Aktif"]})]})]})]})]})}),e.jsx(F,{children:s.active&&a?e.jsxs(e.Fragment,{children:[e.jsxs(ie,{divider:e.jsx(je,{borderColor:"gray.200"}),direction:"row",spacing:"5",children:[e.jsx(j,{flex:"1 1 0px",align:"start",spacing:"4",children:n?e.jsx(Je,{data:a.ispu}):e.jsx(Qe,{data:a.ispu})}),e.jsx(j,{flex:"1 1 0px",align:"start",spacing:"4",children:n?e.jsx(qe,{CO2data:a.co2,CH4data:a.ch4}):e.jsx(Xe,{CH4data:a.ch4,CO2data:a.co2})})]}),e.jsxs(ye,{mt:"6",status:"info",variant:"left-accent",rounded:"md",alignItems:"start",children:[e.jsx(f,{as:Ve,boxSize:"7",color:"blue.600",mt:"2"}),e.jsx(m,{ml:"3",children:(()=>{const p=n?a.ispu.latestData.value[0].recomendation:a.ispu.average.data.value[0].recomendation,b=n?a.ch4.latestData.value.recomendation:a.ch4.average.data.value.recomendation,v=n?a.co2.latestData.value.recomendation:a.co2.average.data.value.recomendation,O=[{recomendation:p},{recomendation:v},{recomendation:b}];return e.jsxs(_,{variant:"soft-rounded",colorScheme:"gray",children:[e.jsxs($,{as:i,children:[e.jsx(be,{m:"0",children:"Rekomendasi"}),e.jsx(C,{}),e.jsx(k,{rounded:"lg",children:"Kualitas Udara"}),e.jsx(k,{rounded:"lg",children:"Emisi Karbondioksida"}),e.jsx(k,{rounded:"lg",children:"Emisi Metana"})]}),e.jsx(X,{pb:"2",children:O.map(({recomendation:y},S)=>e.jsxs(U,{px:"0",py:"2",as:j,align:"start",children:[e.jsx(t,{textIndent:"40px",fontSize:"md",textAlign:"justify",children:y==null?void 0:y.info}),e.jsxs(t,{fontSize:"md",textAlign:"justify",children:[e.jsxs("span",{style:{fontWeight:600},children:["Saran :"," "]}),l=="indoor"?y==null?void 0:y.company:y==null?void 0:y.public]})]},S))})]})})()})]})]}):e.jsx(sa,{data:o,type:l})})]})}function sa({data:o,type:l}){var d;const{all:a,active:s}=o.countNodes,{user:r}=V(),n=a-s;return e.jsxs(i,{justify:"center",px:"3",py:"6",children:[e.jsx(Se,{src:$e,h:"140px"}),e.jsx(j,{align:"start",spacing:"1",children:a?e.jsxs(e.Fragment,{children:[e.jsx(D,{size:"md",children:"Tidak dapat menampilkan data"}),e.jsx(t,{color:"gray.500",fontStyle:"italic",children:"Tidak ada node yang aktif"}),e.jsxs(i,{mt:"3",spacing:"4",children:[e.jsx(W,{boxSize:"40px",border:"2px solid",borderColor:"orange.300",p:"2",rounded:"md",children:e.jsx(f,{as:ke,color:"orange.500",boxSize:"full"})}),e.jsx(t,{fontWeight:"600",fontSize:"lg",children:`Data pada ${n} node Tidak Uptodate `})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs(D,{size:"md",mb:"2",children:["Anda Belum Menambahkan Node ",l=="arround"?"":l]}),l=="arround"?e.jsx(se,{subsInfo:{type:"user",userId:r.userId},children:e.jsx(P,{colorScheme:"blue",leftIcon:e.jsx(te,{size:"18"}),children:"Tambahkan Node"})}):e.jsx(se,{subsInfo:{type:"company",companyData:(d=r.view)==null?void 0:d.company},children:e.jsx(P,{colorScheme:"blue",leftIcon:e.jsx(te,{size:"18"}),children:"Tambahkan Node"})})]})})]})}function wa(){var p,b,v;const{user:o,roleIs:l,roleIsNot:a}=V(),{view:s}=o,r=(p=s==null?void 0:s.user)==null?void 0:p.role,n=r=="regular"?"user":r=="manager"?"company":void 0,d=n==="company"?(b=s==null?void 0:s.company)==null?void 0:b.companyId:n=="user"?(v=s==null?void 0:s.user)==null?void 0:v.userId:void 0;if(n&&!d)return e.jsx(Ae,{role:o.role});if(!n&&l(["admin","gov"]))return e.jsx(Ue,{});const c=d&&n?`${(n=="company"?"/companies/":"/users/")+d}/dashboard`:null,{data:x,isLoading:h}=ze(c,Me);return h||!x?e.jsx(Pe,{}):e.jsxs(j,{spacing:"4",align:"stretch",children:[e.jsx(Ge,{data:x}),x.indoor&&e.jsx(oe,{data:x.indoor,type:"indoor"}),e.jsx(oe,{data:x.outdoor,type:x.dashboardInfo.type=="regular"?"arround":"outdoor"}),a("regular")&&e.jsxs(w,{w:"full",gap:"4",children:[e.jsx(Be,{flex:"1 1 0 ",data:x.currentEventLogs}),e.jsx(_e,{flex:"1 1 0 ",data:x.nearReports})]})]})}export{wa as default};
