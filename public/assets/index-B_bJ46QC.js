import{L as P,r as S,j as e,V as W,M as m,T as C,N as k,R as q,O as z}from"./createReactComponent-CTa0ICdI.js";import{u as Y,d as N,l as o,m as V,e as H,M as $,g as U,h as G,i as J,j as _,a as Q,a2 as X,k as Z,b as ee,f as se,a3 as ae,a4 as te,O as ne}from"./app-B_Z13nOW.js";import{R as B}from"./RequiredIndicator-2TWYoKpw.js";import{u as ie,a as oe}from"./common.utils-Bv_tZ8l0.js";import{n as re,d as le}from"./validator.utils-DgAN61tS.js";import{u as ce,F as f,b as D,c as de,a as E}from"./index.esm-CiZt72Gl.js";import{I as me}from"./IconPlus-Rmn2fZV2.js";import{B as T,F as y,c as I}from"./icon-white-DmkG9gB2.js";import{M as he}from"./chunk-4FCEGNGT-BN-fAiTR.js";import{T as pe}from"./chunk-4IH3O7BJ-Du2ZUHx0.js";import{S as F}from"./chunk-VTV6N5LE-BkSluP-p.js";import{S as ue}from"./SectionTitle-1-PErdnM.js";import{E as xe}from"./EventCalendar-CJtp8561.js";import{C as je,S as ge}from"./CardEventLog-CmGb4I0W.js";import{I as fe}from"./IconNotebookOff-C9COnMa-.js";import{T as De}from"./dateFormating-b7MTPZXO.js";import{F as ye}from"./chunk-KRPLQIP4-noB-ZVK0.js";import"./icon-BHz-Vl6Z.js";import"./index.tags-BMl43ewZ.js";import"./IconMapPin-SH2eIzr7.js";import"./IconTrash-B1u9iJqt.js";import"./IconEdit-BoMKMMSQ.js";import"./IconCalendar-CEFiF34F.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ce=P("outline","checklist","IconChecklist",[["path",{d:"M9.615 20h-2.615a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8",key:"svg-0"}],["path",{d:"M14 19l2 2l4 -4",key:"svg-1"}],["path",{d:"M9 8h4",key:"svg-2"}],["path",{d:"M9 12h2",key:"svg-3"}]]);const be=de().shape({name:re.required("Wajib Diisi"),description:le.required("Wajib Diisi"),type:E().required("Wajib Diisi"),status:E().required("Wajib Diisi"),location:E().nullable()});function ve(){var O,K;const{user:h}=Y(),s=(K=(O=h.view)==null?void 0:O.company)==null?void 0:K.companyId,{isOpen:p,onOpen:r,onClose:b}=N(),l=ie(),[i,M]=S.useState(!1),[u,x]=S.useState(!1),{handleChange:c,handleBlur:j,isSubmitting:A,values:t,setFieldValue:v,resetForm:w,touched:g,errors:n,handleSubmit:L}=ce({initialValues:{name:"",description:"",status:"inProgress",type:"production",location:"",startDate:o().format("YYYY-MM-DD"),endDate:o().format("YYYY-MM-DD"),isCompleted:!1},validationSchema:be,onReset:()=>{M(!1),x(!1)},onSubmit:async a=>{a.endDate=i?a.startDate:u?null:a.endDate;const d=`/companies/${s}/events`;V.post(d,oe(a)).then(()=>{l.success("Kegiatan berhasil ditambahkan"),H(R=>typeof R=="string"&&R.startsWith(d)),b(),w()}).catch(()=>{l.error("Kegiatan gagal ditambahkan")})}});return S.useEffect(()=>{o(t.endDate).isBefore(o(t.startDate))&&v("endDate",t.startDate)},[t.startDate]),S.useEffect(()=>{o(t.endDate).isAfter(o())&&v("isCompleted",!1)},[t.endDate]),e.jsxs(e.Fragment,{children:[e.jsx(T,{leftIcon:e.jsx(me,{size:"20px"}),colorScheme:"blue",children:"Tambah Catatan",onClick:r}),e.jsx($,{size:"2xl",isOpen:p,onClose:b,scrollBehavior:"inside",closeOnEsc:!1,onCloseComplete:w,children:e.jsxs("form",{onSubmit:L,children:[e.jsx(U,{}),e.jsxs(G,{children:[e.jsx(J,{borderBottom:"1px solid",borderColor:"gray.200",children:"Catat Kegiatan"}),e.jsx(he,{}),e.jsx(_,{children:e.jsxs(W,{mx:"auto",spacing:"2",maxW:"container.sm",my:"4",children:[e.jsxs(y,{isInvalid:!!n.name&&g.name,children:[e.jsxs(f,{children:["Nama Kegiatan ",e.jsx(B,{})]}),e.jsx(I,{id:"name",name:"name",placeholder:"Misal : produksi tahu ",onChange:c,onBlur:j}),e.jsx(D,{children:n.name})]}),e.jsxs(y,{isInvalid:!!n.description&&g.description,children:[e.jsxs(f,{children:["Deskripsi Kegiatan ",e.jsx(B,{})]}),e.jsx(pe,{id:"description",name:"description",placeholder:"Tulis deskripsi kegiatan, singkat saja",onChange:c,onBlur:j}),e.jsx(D,{children:n.description})]}),e.jsxs(y,{isInvalid:!!n.location&&g.location,children:[e.jsx(f,{children:"Tempat Kegiatan"}),e.jsx(I,{id:"location",name:"location",placeholder:"Misal : Gudang ",onChange:c,onBlur:j}),e.jsx(D,{children:n.location})]}),e.jsxs(y,{isInvalid:!!n.type&&g.type,children:[e.jsxs(f,{children:["Jenis Kegiatan ",e.jsx(B,{})]}),e.jsx(Q,{id:"type",name:"type",onChange:c,onBlur:j,bg:"white",children:Object.entries(X).map(([a,d])=>e.jsx("option",{value:a,children:d.name},a))}),e.jsx(D,{children:n.type})]}),e.jsxs(m,{w:"full",align:"start",children:[e.jsxs(y,{isInvalid:!!n.startDate&&g.startDate,children:[e.jsxs(f,{children:["Tanggal dimulai ",e.jsx(B,{})]}),e.jsx(I,{id:"startDate",name:"startDate",type:"date",placeholder:"Misal : produksi tahu",value:t.startDate,onChange:c,onBlur:j}),e.jsxs(m,{as:"label",mt:"2",align:"center",cursor:"pointer",w:"fit-content",children:[e.jsx(F,{isChecked:i,onChange:a=>{const{checked:d}=a.target;M(d),d&&v("endDate",t.startDate)}}),e.jsx(C,{children:"Kegiatan hanya sehari"})]}),e.jsx(D,{children:n.startDate})]}),e.jsxs(y,{isInvalid:!!n.endDate&&g.endDate,children:[e.jsx(f,{children:"Tanggal berakhir"}),e.jsx(I,{id:"endDate",name:"endDate",type:"date",min:t.startDate,isDisabled:u||i,value:u?"":t.endDate||"",onChange:a=>v("endDate",a.target.value),onBlur:j}),e.jsx(m,{mt:"2",spacing:"4",children:e.jsxs(m,{as:"label",cursor:"pointer",w:"fit-content",children:[e.jsx(F,{isChecked:u&&!i,isDisabled:i||t.isCompleted,onChange:a=>x(a.target.checked)}),e.jsx(C,{color:i?"gray.400":"inherit",children:"Atur nanti"})]})}),e.jsx(D,{children:n.endDate})]})]}),e.jsxs(m,{alignSelf:"start",as:"label",cursor:"pointer",w:"fit-content",children:[e.jsx(F,{isChecked:t.isCompleted,isDisabled:o(t.endDate).startOf("d").isAfter(o()),onChange:a=>{v("isCompleted",a.target.checked)}}),e.jsx(C,{children:"Kegiatan sudah selesai"})]})]})}),e.jsxs(Z,{borderTop:"1px solid",borderColor:"gray.200",children:[e.jsx(T,{onClick:()=>{w(),b()},children:"Batal"}),e.jsx(T,{colorScheme:"blue",ml:3,type:"submit",isLoading:A,children:"Kirim"})]})]})]})})]})}function ke({companyId:h}){const{data:s}=ee(h?`/companies/${h}/events/overview`:null,se),p=[{title:"Kegiatan Berlangsung",icon:ae,count:s==null?void 0:s.inProgress.count,events:s==null?void 0:s.inProgress.events},{title:"Kegiatan Mendatang",icon:te,count:s==null?void 0:s.upcoming.count,events:s==null?void 0:s.upcoming.events},{title:"Kegiatan Selesai",icon:Ce,count:s==null?void 0:s.complete.count,events:s==null?void 0:s.complete.events,more:!0}];return e.jsx(k,{children:p.map(({title:r,icon:b,count:l,events:i,more:M},u)=>e.jsxs(q.Fragment,{children:[e.jsxs(ue,{IconEl:b,children:[r,!!l&&e.jsx(De,{children:l,ml:"2",colorScheme:"blue"})]}),e.jsx(W,{align:"stretch",children:i?i.length?e.jsxs(e.Fragment,{children:[i.map(x=>e.jsx(je,{event:x},x.eventLogId)),M&&!!l&&e.jsxs(C,{mx:"auto",children:["Dan ",l-i.length," kegiatan terselesaikan lainnya"]})]}):e.jsxs(m,{justify:"center",color:"gray.500",py:"3",children:[e.jsx(fe,{stroke:"1.2",size:"40"}),e.jsxs(C,{fontWeight:"500",fontSize:"lg",children:["Tidak ada ",r]})]}):Array(3).fill(null).map((x,c)=>e.jsx(ne,{h:"60.38px",w:"full"},c))})]},u))})}function Ge(){var p,r;const{user:h}=Y(),s=(r=(p=h.view)==null?void 0:p.company)==null?void 0:r.companyId;return s?e.jsxs(ye,{gap:"3",children:[e.jsx(k,{flex:"1 1 0",position:"relative",h:"100%",w:"full",overflowY:"auto",className:"custom-scrollbar",children:e.jsxs(k,{position:"absolute",pr:"3",w:"full",children:[e.jsxs(m,{justify:"space-between",children:[e.jsxs(k,{children:[e.jsx(z,{size:"lg",children:"Pencatatan"}),e.jsx(C,{children:"Catat seluruh kegiatan di pabrik Anda"})]}),e.jsx(ve,{})]}),e.jsx(ke,{companyId:s})]})}),e.jsx(k,{flex:"1 1 0",minH:"100%",children:e.jsx(xe,{companyId:s})})]}):e.jsx(ge,{selectCompanyOnly:!0})}export{Ge as default};
