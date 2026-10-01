"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {api,API_URL,License,User,token} from "@/lib/api";

type Dashboard={total:number;active:number;expiringSoon:number;suspended:number;revoked:number;expired:number};
const empty={customer:"",product:"",version:"1.0",environment:"DEV",licenseType:"TRIAL",expiryDate:"",features:"dashboard,telemetry"};
export default function Home(){
 const [user,setUser]=useState<User|null>(null),[licenses,setLicenses]=useState<License[]>([]),[dashboard,setDashboard]=useState<Dashboard|null>(null);
 const [login,setLogin]=useState({username:"admin",password:"Password@123"}),[form,setForm]=useState(empty),[search,setSearch]=useState(""),[error,setError]=useState("");
 async function load(){try{const [u,l,d]=await Promise.all([api<User>("/api/auth/me"),api<License[]>("/api/licenses"),api<Dashboard>("/api/dashboard")]);setUser(u);setLicenses(l);setDashboard(d)}catch{logout()}}
 useEffect(()=>{if(token())load()},[]);
 async function signIn(e:FormEvent){e.preventDefault();setError("");try{const r=await api<{token:string;username:string;role:string}>("/api/auth/login",{method:"POST",body:JSON.stringify(login)});localStorage.setItem("token",r.token);await load()}catch(e){setError(e instanceof Error?e.message:"Login failed")}}
 function logout(){localStorage.removeItem("token");setUser(null);setLicenses([]);setDashboard(null)}
 async function create(e:FormEvent){e.preventDefault();setError("");try{await api("/api/licenses",{method:"POST",body:JSON.stringify(form)});setForm(empty);await load()}catch(e){setError(e instanceof Error?e.message:"Create failed")}}
 async function action(id:number,name:string){setError("");try{await api(`/api/licenses/${id}/${name}`,{method:"POST"});await load()}catch(e){setError(e instanceof Error?e.message:"Action failed")}}
 async function download(id:number){const r=await fetch(`${API_URL}/api/licenses/${id}/download`,{headers:{Authorization:`Bearer ${token()}`}});if(!r.ok){setError(await r.text());return}const blob=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`license-${id}.lic`;a.click();URL.revokeObjectURL(a.href)}
 const filtered=useMemo(()=>licenses.filter(x=>`${x.requestId} ${x.customer} ${x.product} ${x.status}`.toLowerCase().includes(search.toLowerCase())),[licenses,search]);
 if(!user)return <main className="loginPage"><form className="card login" onSubmit={signIn}><div className="brand">LLM</div><h1>License Lifecycle Management</h1><p>Standalone local MVP</p><label>Username<input value={login.username} onChange={e=>setLogin({...login,username:e.target.value})}/></label><label>Password<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label>{error&&<div className="error">{error}</div>}<button>Sign in</button><small>Demo: admin / Password@123</small></form></main>;
 const canCreate=["LICENSE_CONTROLLER","SUPER_ADMIN"].includes(user.role);
 return <main><header><div><b>License Lifecycle Management</b><span>Local MVP</span></div><div className="user"><span>{user.username} · {user.role.replaceAll("_"," ")}</span><button className="secondary" onClick={logout}>Logout</button></div></header><section className="container">
 <div className="hero"><div><h1>License Dashboard</h1><p>Search, generate, download and manage licenses.</p></div></div>
 {error&&<div className="error">{error}</div>}
 <div className="stats">{dashboard&&Object.entries(dashboard).map(([k,v])=><div className="stat" key={k}><span>{k.replace(/([A-Z])/g," $1")}</span><strong>{v}</strong></div>)}</div>
 {canCreate&&<details className="card create"><summary>Create license</summary><form onSubmit={create}><div className="grid">{Object.entries(form).map(([k,v])=><label key={k}>{k.replace(/([A-Z])/g," $1")}<input type={k==="expiryDate"?"date":"text"} required={!['features'].includes(k)} value={v} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div><button>Generate license</button></form></details>}
 <div className="card"><div className="toolbar"><h2>Licenses</h2><input placeholder="Search request, customer, product or status" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="tableWrap"><table><thead><tr><th>Request</th><th>Customer</th><th>Product</th><th>Environment</th><th>Status</th><th>Expiry</th><th>Actions</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td>{l.requestId}</td><td>{l.customer}</td><td>{l.product} {l.version}</td><td>{l.environment}</td><td><span className={`pill ${l.status.toLowerCase()}`}>{l.status}</span></td><td>{l.expiryDate}</td><td className="actions"><button className="small" onClick={()=>download(l.id)}>Download</button>{canCreate&&<><button className="small" onClick={()=>action(l.id,"renew")}>Renew</button><button className="small warn" onClick={()=>action(l.id,"suspend")}>Suspend</button><button className="small danger" onClick={()=>action(l.id,"revoke")}>Revoke</button></>}</td></tr>)}</tbody></table>{!filtered.length&&<p className="empty">No licenses found.</p>}</div></div>
 </section></main>
}
