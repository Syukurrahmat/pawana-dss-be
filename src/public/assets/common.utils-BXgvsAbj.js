import{K as t}from"./createReactComponent-m2GCamtz.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var d=t("outline","mood-annoyed","IconMoodAnnoyed",[["path",{d:"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z",key:"svg-0"}],["path",{d:"M15 14c-2 0 -3 1 -3.5 2.05",key:"svg-1"}],["path",{d:"M9 10h-.01",key:"svg-2"}],["path",{d:"M15 10h-.01",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var h=t("outline","mood-check","IconMoodCheck",[["path",{d:"M20.925 13.163a8.998 8.998 0 0 0 -8.925 -10.163a9 9 0 0 0 0 18",key:"svg-0"}],["path",{d:"M9 10h.01",key:"svg-1"}],["path",{d:"M15 10h.01",key:"svg-2"}],["path",{d:"M9.5 15c.658 .64 1.56 1 2.5 1s1.842 -.36 2.5 -1",key:"svg-3"}],["path",{d:"M15 19l2 2l4 -4",key:"svg-4"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var i=t("outline","mood-nervous","IconMoodNervous",[["path",{d:"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 10h.01",key:"svg-1"}],["path",{d:"M15 10h.01",key:"svg-2"}],["path",{d:"M8 16l2 -2l2 2l2 -2l2 2",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var l=t("outline","mood-smile","IconMoodSmile",[["path",{d:"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",key:"svg-0"}],["path",{d:"M9 10l.01 0",key:"svg-1"}],["path",{d:"M15 10l.01 0",key:"svg-2"}],["path",{d:"M9.5 15a3.5 3.5 0 0 0 5 0",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var m=t("outline","mood-wrrr","IconMoodWrrr",[["path",{d:"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z",key:"svg-0"}],["path",{d:"M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1",key:"svg-1"}],["path",{d:"M8.5 11.5l1.5 -1.5l-1.5 -1.5",key:"svg-2"}],["path",{d:"M15.5 11.5l-1.5 -1.5l1.5 -1.5",key:"svg-3"}]]);const y=(e,o)=>{const r={};return Object.keys(e).forEach(a=>{e[a]!==o[a]&&(r[a]=e[a])}),Object.keys(o).forEach(a=>{e[a]!==o[a]&&(r[a]=o[a])}),r},g=e=>{for(let o in e)typeof e[o]=="string"?e[o]=e[o].trim():typeof e[o]=="object"&&(e[o]=g(e[o]));return e},M=e=>new Promise((o,r)=>{if(!e)return o(null);const a=new FileReader;a.readAsDataURL(e),a.onload=()=>o(a.result),a.onerror=r}),v={Baik:"green",Sedang:"blue","Tidak Sehat":"yellow","Sangat Tidak Sehat":"red",Berbahaya:"gray"},c={Baik:{colorScheme:"green",icon:h},Sedang:{colorScheme:"blue",icon:l},"Tidak Sehat":{colorScheme:"yellow",icon:d},"Sangat Tidak Sehat":{colorScheme:"red",icon:i},Berbahaya:{colorScheme:"gray",icon:m}},n={Bersih:{colorScheme:"green",icon:h},Tercemar:{colorScheme:"orange",icon:l},Bahaya:{colorScheme:"red",icon:d}},s={Aman:{colorScheme:"green",icon:h},Tercemar:{colorScheme:"red",icon:l}},k=e=>{const{colorScheme:o,icon:r}=e?c[e]:c.Berbahaya||c.Berbahaya;return{colorScheme:o,icon:r}},S=e=>{const{colorScheme:o}=e?s[e]:s.Tercemar||s.Tercemar;return{colorScheme:o}},u=e=>{const{colorScheme:o}=e?n[e]:n.Bahaya||n.Bahaya;return{colorScheme:o}},I=e=>new Promise(o=>setTimeout(o,e));export{v as I,g as a,u as b,y as c,S as d,m as e,l as f,k as g,I as h,M as t};
