export const API_URL=process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export type User={username:string;role:string};
export type License={id:number;requestId:string;customer:string;product:string;version:string;environment:string;licenseType:string;status:string;createdDate:string;expiryDate:string;features:string};
export function token(){return typeof window!=="undefined"?localStorage.getItem("token"):null}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 const headers=new Headers(options.headers); headers.set("Content-Type","application/json"); const t=token(); if(t) headers.set("Authorization",`Bearer ${t}`);
 const response=await fetch(`${API_URL}${path}`,{...options,headers});
 if(!response.ok){const text=await response.text();throw new Error(text||`Request failed: ${response.status}`)}
 if(response.status===204)return undefined as T; return response.json();
}
