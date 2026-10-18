import {check} from '../../src/core.mjs';
const enc=new TextEncoder(),dec=new TextDecoder();
export const b64u=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export const from64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export const randomSecret=()=>b64u(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async value=>b64u(await crypto.subtle.digest('SHA-256',enc.encode(value)));
export async function createVault(keyString){let raw;try{raw=from64(keyString||'');}catch{raw=[];}check(raw.length===32,'Falta la clave de cifrado del servidor.','VAULT_REQUIRED',503);const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);return{async seal(value,context){const iv=crypto.getRandomValues(new Uint8Array(12)),ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(context)},key,enc.encode(JSON.stringify(value)));return JSON.stringify({v:1,iv:b64u(iv),data:b64u(ciphertext)});},async open(value,context){const e=JSON.parse(value);check(e.v===1,'Versión de cifrado no compatible.');const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(e.iv),additionalData:enc.encode(context)},key,from64(e.data));return JSON.parse(dec.decode(bytes));}};}
