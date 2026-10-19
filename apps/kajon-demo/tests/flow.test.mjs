import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const source = name => readFileSync(resolve(root,'src',name),'utf8');
function assertBalanced(markup) {
  const stack=[],voids=new Set(['input','img','br','hr','meta','link','source','area','base','embed','param','track','wbr']);
  for(const match of markup.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)){
    const tag=match[1].toLowerCase();
    if(match[0].startsWith('</'))assert.equal(stack.pop(),tag,'Unbalanced generated markup near '+match[0]);
    else if(!voids.has(tag)&&!match[0].endsWith('/>'))stack.push(tag);
  }
  assert.equal(stack.length,0,'Unclosed generated markup: '+stack.join(', '));
}
function memoryStorage() {
  const values = new Map();
  return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}
function modelContext(storage=memoryStorage()) {
  const context=createContext({Intl,Date,JSON,console});
  runInContext(source('demo-data.js'),context);
  runInContext(source('model.js'),context);
  return {context,M:context.KajonModel,D:context.KajonData,storage};
}
function domContext(storage=memoryStorage()) {
  const setup=modelContext(storage), elements=new Map(), copied=[];
  class Element {
    constructor(id){this.id=id;this.dataset={};this.listeners={};this._html='';this.textContent='';this.hidden=false;this.open=false;this.childrenIds=[];this.value='';}
    set innerHTML(value){
      for(const child of this.childrenIds)elements.delete(child);
      this._html=value;this.childrenIds=[];
      for(const match of value.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
        const el=new Element(match[3]);el.value=/\bvalue="([^"]*)"/.exec(match[2])?.[1]||'';
        elements.set(el.id,el);this.childrenIds.push(el.id);
      }
    }
    get innerHTML(){return this._html;}
    addEventListener(name,fn){this.listeners[name]=fn;}
    showModal(){this.open=true;}
    close(){this.open=false;}
    focus(){}
    setSelectionRange(){}
    scrollIntoView(){}
  }
  for(const id of ['app','dialogs','live-message'])elements.set(id,new Element(id));
  const document={getElementById:id=>elements.get(id)||null,querySelector:()=>new Element('query')};
  const location={hash:''};
  Object.assign(setup.context,{document,location,history:{replaceState:(_,__,hash)=>{location.hash=hash;}},navigator:{clipboard:{writeText:async text=>{copied.push(text);}}},setTimeout:()=>1,clearTimeout:()=>{},window:{localStorage:storage,matchMedia:()=>({matches:false}),addEventListener:()=>{}}});
  runInContext(source('app.js'),setup.context);
  const click=async(dataset,inside='app')=>{
    const target={dataset,closest(){return this;}};
    await elements.get(inside).listeners.click({target,preventDefault(){}});
  };
  const input=(id,value,inside='dialogs')=>{
    const target={id,value,dataset:{},hasAttribute:()=>false};
    elements.get(inside).listeners.input({target});
  };
  return {...setup,elements,copied,click,input,location};
}

test('static demo has only local assets and a hard network policy',()=>{
  const index=source('index.html');
  assert.match(index,/connect-src 'none'/);
  assert.match(index,/form-action 'none'/);
  assert.match(source('_headers'),/frame-ancestors 'none'/);
  for(const name of readdirSync(resolve(root,'src')).filter(name=>/\.(?:js|css|html)$/.test(name))){
    const body=source(name);
    assert.doesNotMatch(body,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\s*\(/,name+' must not initiate network calls');
    assert.doesNotMatch(body,/(?:src|href)=["'](?:https?:)?\/\//,name+' must not load remote assets');
    assert.doesNotMatch(body,/localStorage\.clear\s*\(/,name+' must not clear another app storage');
  }
  assert.doesNotMatch(source('styles.css'),/@import|url\(/);
  for(const path of index.matchAll(/(?:src|href)="\.\/([^"]+)"/g))assert.ok(source(path[1]).length>0);
});

test('fixtures cover every score color, no real source identities or private records',()=>{
  const {M,D}=modelContext();
  assert.equal(D.seed.stories.length,8);
  assert.deepEqual(new Set(D.seed.stories.map(s=>M.color(s.score))),new Set(['green','orange','red','grey']));
  for(const item of D.seed.stories){assert.match(item.source,/ejemplo/);assert.match(item.excerpt,/ficticio/);assert.match(item.id,/^demo-/);}
  assert.doesNotMatch(JSON.stringify(D.seed),/https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  assert.equal(M.color(4.9),'red');assert.equal(M.color(5),'orange');assert.equal(M.color(7.4),'orange');assert.equal(M.color(7.5),'green');
});

test('24-hour filtering stays anchored to the disclosed demo date',()=>{
  const {M,D}=modelContext();const state=M.clone(D.seed);
  const recent=M.visible(state,{period:'24'});
  assert.equal(recent.length,5);
  assert.ok(recent.every(s=>Date.parse(state.referenceNow)-Date.parse(s.published)<=86400000));
  assert.equal(M.visible(state,{query:'herramienta'}).length,2);
  assert.equal(M.visible(state,{topic:'Marketing'}).length,1);
  assert.equal(M.visible(state,{status:'descartada'}).length,1);
});

test('choose, prepared draft, edit, save, publish and reload persist coherently',()=>{
  const {M,D,storage}=modelContext();let state=M.clone(D.seed);
  M.setState(state,'demo-01','elegida');
  const proposal=M.sample(state,'demo-01','linkedin',D.samples);
  let entry=M.savePiece(state,'demo-01','linkedin',proposal,'nutrir',proposal);
  assert.equal(entry.status,'Base lista');
  entry=M.savePiece(state,'demo-01','linkedin',proposal+'\nMi matiz editorial.','convertir',proposal);
  assert.equal(entry.status,'Retocada');
  M.publish(state,'demo-01','linkedin');
  assert.equal(entry.status,'Publicada');assert.ok(entry.publishedAt);
  assert.equal(M.persist(storage,state),true);
  state=M.load(storage,D.seed);
  const saved=M.piece(state,'demo-01','linkedin');
  assert.equal(saved.status,'Publicada');assert.equal(saved.objective,'convertir');assert.match(saved.body,/Mi matiz editorial/);
  assert.equal(D.seed.pieces.length,2,'initial fixtures must not be mutated');
});

test('discard and recover, scoring, and a reset only affect the demo namespace',()=>{
  const {M,D,storage}=modelContext();let state=M.clone(D.seed);
  storage.setItem('private-application-data','untouched');
  M.setState(state,'demo-01','descartada');assert.ok(!M.visible(state,{}).some(s=>s.id==='demo-01'));
  M.setState(state,'demo-01','detectada');assert.ok(M.visible(state,{}).some(s=>s.id==='demo-01'));
  assert.equal(M.story(state,'demo-07').score,null);assert.equal(M.score(state,'demo-07'),7.3);
  M.persist(storage,state);state=M.reset(storage,D.seed);
  assert.equal(storage.getItem('private-application-data'),'untouched');assert.equal(storage.getItem(M.STORAGE_KEY),null);assert.equal(M.story(state,'demo-07').score,null);
});

test('unavailable or malformed browser storage keeps the demonstration usable',()=>{
  const {M,D,storage}=modelContext();storage.setItem(M.STORAGE_KEY,'broken json');
  assert.equal(M.load(storage,D.seed).stories.length,8);
  const blocked={getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');},removeItem(){throw Error('Blocked');}};
  assert.equal(M.load(blocked,D.seed).stories.length,8);assert.equal(M.persist(blocked,D.seed),false);assert.equal(M.reset(blocked,D.seed).pieces.length,2);
  assert.equal(M.escape('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('rendered application completes the user interaction through the public archive',async()=>{
  const demo=domContext();
  assert.match(demo.elements.get('app').innerHTML,/Menos ruido/);
  assertBalanced(demo.elements.get('app').innerHTML);
  await demo.click({action:'analysis',id:'demo-01'});
  assert.ok(demo.elements.get('demo-dialog').open);
  assert.match(demo.elements.get('demo-dialog').innerHTML,/Cargar borrador de ejemplo/);
  assertBalanced(demo.elements.get('demo-dialog').innerHTML);
  await demo.click({action:'load-sample'},'dialogs');
  demo.input('draft-body','Mi texto de demostración <script>alert(1)</script>');
  await demo.click({action:'save-draft'},'dialogs');
  await demo.click({action:'publish-draft'},'dialogs');
  assert.equal(demo.location.hash,'#published');
  const markup=demo.elements.get('app').innerHTML;
  assert.match(markup,/Publicada · demo/);assert.match(markup,/Mi texto de demostración &lt;script&gt;/);assert.doesNotMatch(markup,/<script>alert/);
  await demo.click({action:'copy-piece',id:'piece-demo-01-linkedin'});
  assert.equal(demo.copied.length,1);
  assert.match(demo.copied[0],/Mi texto de demostración/);
  const reload=domContext(demo.storage);await reload.click({nav:'published'});
  assert.match(reload.elements.get('app').innerHTML,/Mi texto de demostración/);
});

test('all navigation destinations render, source filter works, and reset restores examples',async()=>{
  const demo=domContext();
  for(const view of ['desk','published','sources','settings','radar']){await demo.click({nav:view});assert.ok(demo.elements.get('app').innerHTML.length>1000);assert.equal(demo.location.hash,'#'+view);}
  await demo.click({source:'Cuaderno de comercio · ejemplo'});
  assert.match(demo.elements.get('app').innerHTML,/1 de 8 historias/);
  await demo.click({action:'score-all'});
  await demo.click({action:'reset'});
  await demo.click({action:'confirm-reset'},'dialogs');
  assert.equal(demo.storage.getItem(demo.M.STORAGE_KEY),null);
  assert.match(demo.elements.get('app').innerHTML,/7 de 8 historias/);
});

test('prepared flash examples fit their disclosed reference length',()=>{
  const {M,D}=modelContext();
  for(const item of D.seed.stories)assert.ok(M.sample(D.seed,item.id,'flash',D.samples).length<=280,item.id);
});
