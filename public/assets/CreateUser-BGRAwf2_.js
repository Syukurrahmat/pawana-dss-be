import{D as A,j as e,N as C,J as S,T as P,E as I,V as y,Z as n,Q as m,H as F,C as M}from"./createReactComponent-m2GCamtz.js";import{n as R,a as q,b as T,d as W,e as N}from"./validator.utils-BSOb9322.js";import{c as V,a as D,F as s,b as r}from"./index.esm-DXWgZSHY.js";import{u as E}from"./formik.esm-X4pWCQgU.js";import{a as H}from"./common.utils-BXgvsAbj.js";import{c as w,R as L}from"./app-BlQRCkbL.js";import{M as c}from"./MyRadio-Do7ujEfU.js";import{R as t}from"./RequiredIndicator-DdPXie2d.js";import{B as x}from"./BigAlert-ClPlFLp7.js";import{T as j}from"./chunk-4IH3O7BJ-BSUfzZnZ.js";import"./IconCirclePlus-D9W8Q483.js";function Y(){const{handleChange:l,handleBlur:o,isSubmitting:g,setSubmitting:f,touched:i,resetForm:u,setFieldValue:k,values:B,status:h,setStatus:p,errors:a,handleSubmit:b}=E({initialValues:{name:"",email:"",phone:"",description:"",role:"regular",address:"",profilePicture:""},validationSchema:V().shape({name:R.required("Wajib diisi"),phone:q.required("Wajib diisi"),address:T.required("Wajib diisi"),description:W.nullable(),email:N.required("Wajib diisi"),role:D().required("Wajib diisi")}),onSubmit:d=>{console.log(JSON.stringify(d)),w.post(A+"/users",H(d)).then(({data:v})=>p(v.success)).catch(()=>p(!1)).finally(()=>f(!1))}});return e.jsxs(C,{children:[e.jsx(S,{size:"lg",children:"Buat akun Pengguna"}),e.jsx(P,{children:"Buat Akun pengguna untuk memberikan akses orang lain ke DSS ini"}),e.jsx(I,{maxW:"container.sm",mt:"6",children:h!==void 0?h?e.jsx(x,{status:"success",title:"Akun berhasil didaftarkan",description:`Alamat email terdaftar akan menerima tautan verifikasi. 
\r Klik tautan tersebut untuk mengaktifkan akun dan menyelesaikan pendaftaran.`,onCreateAgain:u}):e.jsx(x,{status:"warning",title:"Akun gagal didaftarkan",description:"Ada yang salah. Hubungi Administrator",onCreateAgain:u}):e.jsx("form",{onSubmit:b,className:"my-form",children:e.jsxs(y,{mx:"auto",spacing:"2",children:[e.jsxs(n,{isInvalid:!!a.name&&i.name,children:[e.jsxs(s,{children:["Nama ",e.jsx(t,{})]}),e.jsx(m,{id:"name",name:"name",placeholder:"Misal : Suparna",onChange:l,onBlur:o}),e.jsx(r,{children:a.name})]}),e.jsxs(n,{isInvalid:!!a.email&&i.email,children:[e.jsxs(s,{children:["Email ",e.jsx(t,{})]}),e.jsx(m,{id:"email",name:"email",placeholder:"Misal : suparna@gmail.com",onChange:l,onBlur:o}),e.jsx(r,{children:a.email})]}),e.jsxs(n,{isInvalid:!!a.phone&&i.phone,children:[e.jsxs(s,{children:["Nomor Telepon ",e.jsx(t,{})]}),e.jsx(m,{id:"phone",name:"phone",placeholder:"Misal : 087812345678",onChange:l,onBlur:o}),e.jsx(r,{children:a.phone})]}),e.jsxs(n,{isInvalid:!!a.address&&i.address,children:[e.jsxs(s,{children:["Alamat ",e.jsx(t,{})]}),e.jsx(j,{id:"address",name:"address",placeholder:"Masukkan Alamat Tempat tinggal Pengguna",onChange:l,onBlur:o}),e.jsx(r,{children:a.address})]}),e.jsxs(n,{isInvalid:!!a.description&&i.description,children:[e.jsx(s,{children:"Description"}),e.jsx(j,{id:"description",name:"description",placeholder:"Opsional",onChange:l,onBlur:o}),e.jsx(r,{children:a.description})]}),e.jsxs(n,{isInvalid:!!a.role&&i.role,children:[e.jsxs(s,{children:["Peran pengguna ",e.jsx(t,{})]}),e.jsx(L,{onChange:d=>k("role",d),value:B.role,children:e.jsxs(F,{spacing:4,direction:"row",children:[e.jsx(c,{value:"regular",children:"Reguler"}),e.jsx(c,{value:"manager",children:"Manager"}),e.jsx(c,{value:"admin",children:"Admin"}),e.jsx(c,{value:"gov",children:"Pemerintah"})]})}),e.jsx(r,{children:a.role})]}),e.jsxs(n,{isInvalid:!!a.profilePicture&&i.profilePicture,children:[e.jsx(s,{children:"Foto Profil"}),e.jsx(m,{type:"file",id:"profilePicture",name:"profilePicture",onChange:l,onBlur:o,accept:"image/*",isDisabled:!0}),e.jsx(r,{children:a.profilePicture})]}),e.jsx(M,{isLoading:g,w:"full",mt:"4",colorScheme:"green",type:"submit",children:"Buat Akun"})]})})})]})}export{Y as default};
