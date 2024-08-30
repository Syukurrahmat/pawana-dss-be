import{j as e,N as M,O as I,T as R,F as T,V as q,M as W}from"./createReactComponent-CTa0ICdI.js";import{u as E,a as N}from"./common.utils-Bv_tZ8l0.js";import{n as V,a as w,b as H,d as D,e as L}from"./validator.utils-DgAN61tS.js";import{u as O,c as $,a as z,F as s,b as r}from"./index.esm-CiZt72Gl.js";import{B as k}from"./BigAlert-BmrQyIXX.js";import{M as d}from"./MyRadio-DdMiZXgZ.js";import{R as t}from"./RequiredIndicator-2TWYoKpw.js";import{m as G,R as K}from"./app-B_Z13nOW.js";import{F as n,c as m,B as U}from"./icon-white-DmkG9gB2.js";import{T as B}from"./chunk-4IH3O7BJ-Du2ZUHx0.js";import"./IconCirclePlus-1c9aJlrm.js";import"./icon-BHz-Vl6Z.js";function le(){const b=E(),{handleChange:l,handleBlur:o,isSubmitting:v,setSubmitting:A,touched:i,resetForm:u,setFieldValue:C,values:P,status:h,setStatus:p,setFieldError:F,errors:a,handleSubmit:S}=O({initialValues:{name:"",email:"",phone:"",description:"",role:"regular",address:"",profilePicture:""},validationSchema:$().shape({name:V.required("Wajib diisi"),phone:w.required("Wajib diisi"),address:H.required("Wajib diisi"),description:D.nullable(),email:L.required("Wajib diisi"),role:z().required("Wajib diisi")}),onSubmit:c=>{G.post("/users",N(c)).then(()=>{p({created:!0})}).catch(x=>{var g,f;if(((g=x.response)==null?void 0:g.status)!==400)return p({created:!1});const[y,j]=((f=x.response)==null?void 0:f.data.message)||[];F(y,j),b.error(j||"Ada yang salah")}).finally(()=>A(!1))}});return e.jsxs(M,{children:[e.jsx(I,{size:"lg",children:"Buat akun Pengguna"}),e.jsx(R,{children:"Buat Akun pengguna untuk memberikan akses orang lain ke sistem"}),e.jsx(T,{maxW:"container.sm",mt:"6",children:h!==void 0?h.created?e.jsx(k,{status:"success",title:"Akun berhasil didaftarkan",description:`Alamat email terdaftar akan menerima tautan verifikasi. 
\r Klik tautan tersebut untuk mengaktifkan akun dan menyelesaikan pendaftaran.`,onCreateAgain:u}):e.jsx(k,{status:"warning",title:"Akun gagal didaftarkan",description:"Ada yang salah. Hubungi Administrator",onCreateAgain:u}):e.jsx("form",{onSubmit:S,className:"my-form",children:e.jsxs(q,{mx:"auto",spacing:"2",children:[e.jsxs(n,{isInvalid:!!a.name&&i.name,children:[e.jsxs(s,{children:["Nama ",e.jsx(t,{})]}),e.jsx(m,{id:"name",name:"name",placeholder:"Misal : Suparna",onChange:l,onBlur:o}),e.jsx(r,{children:a.name})]}),e.jsxs(n,{isInvalid:!!a.email&&i.email,children:[e.jsxs(s,{children:["Email ",e.jsx(t,{})]}),e.jsx(m,{id:"email",name:"email",placeholder:"Misal : suparna@gmail.com",onChange:l,onBlur:o}),e.jsx(r,{children:a.email})]}),e.jsxs(n,{isInvalid:!!a.phone&&i.phone,children:[e.jsxs(s,{children:["Nomor Telepon ",e.jsx(t,{})]}),e.jsx(m,{id:"phone",name:"phone",placeholder:"Misal : 087812345678",onChange:l,onBlur:o}),e.jsx(r,{children:a.phone})]}),e.jsxs(n,{isInvalid:!!a.address&&i.address,children:[e.jsxs(s,{children:["Alamat ",e.jsx(t,{})]}),e.jsx(B,{id:"address",name:"address",placeholder:"Masukkan Alamat Tempat tinggal Pengguna",onChange:l,onBlur:o}),e.jsx(r,{children:a.address})]}),e.jsxs(n,{isInvalid:!!a.description&&i.description,children:[e.jsx(s,{children:"Description"}),e.jsx(B,{id:"description",name:"description",placeholder:"Opsional",onChange:l,onBlur:o}),e.jsx(r,{children:a.description})]}),e.jsxs(n,{isInvalid:!!a.role&&i.role,children:[e.jsxs(s,{children:["Peran pengguna ",e.jsx(t,{})]}),e.jsx(K,{onChange:c=>C("role",c),value:P.role,children:e.jsxs(W,{spacing:4,direction:"row",children:[e.jsx(d,{value:"regular",children:"Reguler"}),e.jsx(d,{value:"manager",children:"Manager"}),e.jsx(d,{value:"admin",children:"Admin"}),e.jsx(d,{value:"gov",children:"Pemerintah"})]})}),e.jsx(r,{children:a.role})]}),e.jsxs(n,{isInvalid:!!a.profilePicture&&i.profilePicture,children:[e.jsx(s,{children:"Foto Profil"}),e.jsx(m,{type:"file",id:"profilePicture",name:"profilePicture",onChange:l,onBlur:o,accept:"image/*",isDisabled:!0}),e.jsx(r,{children:a.profilePicture})]}),e.jsx(U,{isLoading:v,w:"full",mt:"4",colorScheme:"green",type:"submit",children:"Buat Akun"})]})})})]})}export{le as default};
