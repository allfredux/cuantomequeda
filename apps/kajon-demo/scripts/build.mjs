import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await rm(output, {recursive:true,force:true});
await mkdir(output, {recursive:true});
for (const file of await readdir(resolve(root, 'src'))) await cp(resolve(root,'src',file),resolve(output,file),{recursive:true});
console.log('Static demo built in dist/; no install, framework or server required.');
