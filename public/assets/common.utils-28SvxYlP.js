import{N as s,a1 as i}from"./font-5Mxaz-3e.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var h=s("outline","mood-annoyed","IconMoodAnnoyed",[["path",{d:"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z",key:"svg-0"}],["path",{d:"M15 14c-2 0 -3 1 -3.5 2.05",key:"svg-1"}],["path",{d:"M9 10h-.01",key:"svg-2"}],["path",{d:"M15 10h-.01",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var d=s("outline","mood-check","IconMoodCheck",[["path",{d:"M20.925 13.163a8.998 8.998 0 0 0 -8.925 -10.163a9 9 0 0 0 0 18",key:"svg-0"}],["path",{d:"M9 10h.01",key:"svg-1"}],["path",{d:"M15 10h.01",key:"svg-2"}],["path",{d:"M9.5 15c.658 .64 1.56 1 2.5 1s1.842 -.36 2.5 -1",key:"svg-3"}],["path",{d:"M15 19l2 2l4 -4",key:"svg-4"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var m=s("outline","mood-nervous","IconMoodNervous",[["path",{d:"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 10h.01",key:"svg-1"}],["path",{d:"M15 10h.01",key:"svg-2"}],["path",{d:"M8 16l2 -2l2 2l2 -2l2 2",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var l=s("outline","mood-smile","IconMoodSmile",[["path",{d:"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 10l.01 0",key:"svg-1"}],["path",{d:"M15 10l.01 0",key:"svg-2"}],["path",{d:"M9.5 15a3.5 3.5 0 0 0 5 0",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var p=s("outline","mood-wrrr","IconMoodWrrr",[["path",{d:"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z",key:"svg-0"}],["path",{d:"M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1",key:"svg-1"}],["path",{d:"M8.5 11.5l1.5 -1.5l-1.5 -1.5",key:"svg-2"}],["path",{d:"M15.5 11.5l-1.5 -1.5l1.5 -1.5",key:"svg-3"}]]);const u=(e,o)=>{const r={};return Object.keys(e).forEach(a=>{e[a]!==o[a]&&(r[a]=e[a])}),Object.keys(o).forEach(a=>{e[a]!==o[a]&&(r[a]=o[a])}),r},g=e=>{for(let o in e)typeof e[o]=="string"?(e[o]=e[o].trim(),e[o]||delete e[o]):typeof e[o]=="object"&&(e[o]=g(e[o]));return e},M=e=>new Promise((o,r)=>{if(!e)return o(null);const a=new FileReader;a.readAsDataURL(e),a.onload=()=>o(a.result),a.onerror=r}),v=e=>new Promise(o=>setTimeout(o,e)),k=()=>{const e=i();return{success:(o,r)=>e({status:"success",title:"Berhasil",description:o,...r}),error:(o,r)=>e({status:"error",title:"Gagal",description:o,...r}),opss:(o,r)=>e({title:"Opss !!!",status:"warning",description:o,...r})}},S={Baik:"green",Sedang:"blue","Tidak Sehat":"yellow","Sangat Tidak Sehat":"red",Berbahaya:"gray"},t={Baik:{colorScheme:"green",icon:d},Sedang:{colorScheme:"blue",icon:l},"Tidak Sehat":{colorScheme:"yellow",icon:h},"Sangat Tidak Sehat":{colorScheme:"red",icon:m},Berbahaya:{colorScheme:"gray",icon:p}},c={Bersih:{colorScheme:"green",icon:d},Tercemar:{colorScheme:"orange",icon:l},Bahaya:{colorScheme:"red",icon:h}},n={Aman:{colorScheme:"green",icon:d},Tercemar:{colorScheme:"red",icon:l}},I=e=>{const{colorScheme:o,icon:r}=e?t[e]:t.Berbahaya||t.Berbahaya;return{colorScheme:o,icon:r}},f=e=>{const{colorScheme:o}=e?n[e]:n.Tercemar||n.Tercemar;return{colorScheme:o}},B=e=>{const{colorScheme:o}=e?c[e]:c.Bahaya||c.Bahaya;return{colorScheme:o}},P={base:"sm",md:"md"};export{S as I,g as a,B as b,u as c,f as d,p as e,l as f,I as g,v as h,P as r,M as t,k as u};
