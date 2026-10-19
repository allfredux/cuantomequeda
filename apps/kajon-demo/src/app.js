(function () {
  'use strict';
  const M = globalThis.KajonModel;
  const D = globalThis.KajonData;
  const html = M.escape;
  const app = document.getElementById('app');
  const dialogs = document.getElementById('dialogs');
  const storage = {getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value),removeItem:key=>window.localStorage.removeItem(key)};
  let state = M.load(storage, D.seed);
  const defaults = () => ({status:'active',kind:'all',period:'all',query:'',topic:'all',priority:'all'});
  const ui = {view:'radar',filters:defaults(),selected:'demo-01',original:false,editor:null,publishedQuery:'',publishedChannel:'all'};
  const nav = [['radar','Radar','radar'],['desk','Mesa editorial','edit'],['published','Publicadas','check'],['sources','Fuentes','rss'],['settings','Configuración','settings']];
  const labels = {flash:'Flash X',linkedin:'LinkedIn',web:'Archivo web'};
  const stateLabels = {detectada:'Detectada',elegida:'Elegida',mas_tarde:'Más tarde',descartada:'Descartada'};
  const number = value => value === null ? '—' : value.toLocaleString('es-ES',{maximumFractionDigits:1});
  const date = value => new Date(value).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Madrid'});
  const paths = {
    radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 7-7"/>',
    edit:'<path d="M15 5H5v15h14V10M13 11l7-7-3-3-7 7-1 4z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    rss:'<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
    settings:'<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    right:'<path d="m9 5 7 7-7 7"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
    play:'<path d="m9 5 11 7-11 7z"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    spark:'<path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>'
  };
  function icon(name,size) { return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.info)+'</svg>'; }
  function persist() { const ok=M.persist(storage,state); if(!ok) notify('El navegador no permite guardar. Puedes seguir explorando durante esta visita.'); return ok; }
  let toastTimer;
  function notify(message) {
    const box=document.getElementById('live-message'); box.textContent=message; box.hidden=false;
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>{box.hidden=true;},6000);
  }
  function options(values,current) { return values.map(([value,label])=>'<option value="'+html(value)+'"'+(value===current?' selected':'')+'>'+html(label)+'</option>').join(''); }
  function badge(item,big) { return '<span class="score-circle '+M.color(item.score)+(big?' detail-score':'')+'" aria-label="Puntuación de ejemplo: '+(item.score===null?'sin puntuar':number(item.score)+' sobre 10')+'"><strong>'+number(item.score)+'</strong><span>/ 10</span></span>'; }
  function setView(view) {
    if(!nav.some(item=>item[0]===view)) return;
    ui.view=view; try{history.replaceState(null,'','#'+view);}catch(_){} render();
    document.getElementById('page-title').focus({preventScroll:true});
  }
  function render() {
    const title=ui.view==='radar'?'Menos ruido. Más <em>criterio.</em>':ui.view==='desk'?'Tu próxima <em>pieza.</em>':ui.view==='published'?'Lo que ya has <em>publicado.</em>':ui.view==='sources'?'Volver al <em>origen.</em>':'Tú marcas el <em>ritmo.</em>';
    const subtitle=ui.view==='radar'?'Las señales que importan. La perspectiva la pones tú.':ui.view==='desk'?'De una fuente a una idea con voz propia. Prueba el recorrido.':ui.view==='published'?'Un archivo para conservar cada pieza después de terminarla.':ui.view==='sources'?'Explora cómo se organiza el origen de cada historia.':'Ajusta la experiencia de esta sesión de ejemplo.';
    app.innerHTML='<div class="shell">'+
      '<aside class="sidebar"><a class="brand" href="#radar" data-nav="radar" aria-label="Kajón, inicio"><span class="brand-mark">k<span>·</span></span><span>kajon<span class="brand-dot">.</span></span></a><div class="workspace-label">ESPACIO EDITORIAL <span>DEMO</span></div><nav aria-label="Navegación principal">'+nav.map(([key,label,glyph])=>'<button class="nav-item '+(key===ui.view?'selected':'')+'" data-nav="'+key+'" aria-label="'+label+'" title="'+label+'"'+(key===ui.view?' aria-current="page"':'')+'>'+icon(glyph)+'<span>'+label+'</span>'+(key==='radar'?'<span class="nav-count">'+state.stories.filter(s=>s.state!=='descartada').length+'</span>':key===ui.view?icon('right',14):'')+'</button>').join('')+'</nav><div class="side-note"><span class="tiny-label">EL MÉTODO</span><p>Primero la fuente.<br>Después, tu criterio.</p><div class="small-rule"></div><span>La última palabra<br>siempre es tuya.</span></div><div class="sidebar-bottom"><span class="private">'+icon('eye',13)+' Demo interactiva</span><div class="profile"><span class="avatar">V</span><div><strong>Visitante</strong><small>Explorando Kajón</small></div><span class="online-dot"></span></div></div></aside>'+
      '<main class="main" id="main"><header class="topbar"><div><span class="crumb">Explora Kajón</span>'+icon('right',13)+'<strong>'+nav.find(n=>n[0]===ui.view)[1]+'</strong></div><span class="header-right"><span class="status-dot"></span> Sesión de ejemplo <span class="top-divider"></span>'+icon('eye',14)+' Visita libre</span></header><div class="demo-banner"><span class="demo-label">DEMO</span><p>Historias ficticias para explorar Kajón. Tus cambios se guardan solo en este navegador.</p><button data-action="reset">Reiniciar '+icon('reset',13)+'</button></div><div class="page-content"><div class="page-heading"><div><div class="eyebrow"><span class="orange-line"></span> INTELIGENCIA EDITORIAL</div><h1 id="page-title" tabindex="-1">'+title+'</h1><p>'+subtitle+'</p></div><div class="heading-actions"><button class="btn secondary" data-action="about">'+icon('play',15)+' Cómo funciona</button></div></div>'+
      (ui.view==='radar'?renderRadar():ui.view==='desk'?renderDesk():ui.view==='published'?renderPublished():ui.view==='sources'?renderSources():renderSettings())+
      '<footer class="footer"><span><strong>kajon.</strong> <span>De la señal a tu criterio.</span></span><span>INTERFAZ · 14 OCT 2026 · Ejemplos ficticios</span></footer></div></main></div>';
  }
  function renderRadar() {
    const list=M.visible(state,ui.filters), current=list.find(item=>item.id===ui.selected)||list[0];
    const high=state.stories.filter(item=>item.score!==null&&item.score>=state.threshold&&item.state!=='descartada').length;
    const countDraft=state.pieces.filter(p=>!p.publishedAt).length;
    const counts=[['HISTORIAS DE EJEMPLO',state.stories.length,'Para recorrer el producto','rss'],['ALTA PRIORIDAD',high,'Según el umbral de la demo','radar'],['EN TU MESA',countDraft,'Borradores guardados aquí','bookmark'],['PUBLICADAS',state.pieces.filter(p=>p.publishedAt).length,'Registros de demostración','check']];
    return '<section aria-label="Radar de noticias de ejemplo"><div class="stats">'+counts.map(([label,value,note,glyph])=>'<div class="metric"><div class="metric-label">'+label+icon(glyph)+'</div><div class="metric-value">'+value+'</div><small>'+note+'</small></div>').join('')+'</div><div class="radar-toolbar"><div><h2>Historias que merecen tu atención</h2><p>Ordenadas por relevancia · '+list.length+' historias · Sesión del 19 de octubre</p></div><button class="btn accent" data-action="score-all">'+icon('spark',15)+' Cargar puntuaciones de ejemplo</button></div>'+
      '<div class="filters demo-filter-tabs"><div class="filter-tabs">'+[['active','Todas'],['detectada','Detectadas'],['elegida','Elegidas'],['mas_tarde','Más tarde'],['descartada','Descartadas']].map(([value,label])=>'<button data-status="'+value+'" class="'+(ui.filters.status===value?'active':'')+'" aria-pressed="'+(ui.filters.status===value)+'">'+label+'</button>').join('')+'</div></div>'+
      '<div class="search-row demo-filters"><label class="search">'+icon('search',16)+'<input id="search-stories" aria-label="Buscar historias" data-filter="query" value="'+html(ui.filters.query)+'" placeholder="Buscar una historia, un tema, una fuente…"></label><select aria-label="Tipo de fuente" data-filter="kind">'+options([['all','Todas las fuentes'],['primary','Primarias'],['secondary','Medios']],ui.filters.kind)+'</select><select aria-label="Antigüedad" data-filter="period">'+options([['all','Todos los ejemplos'],['24','Últimas 24 h · demo']],ui.filters.period)+'</select><select aria-label="Prioridad" data-filter="priority">'+options([['all','Toda prioridad'],['high','Alta prioridad']],ui.filters.priority)+'</select></div>'+
      '<div class="demo-topics" role="group" aria-label="Filtrar por tema">'+[['all','Todo'],['Ai','Ai'],['Negocio','Negocio'],['Producto','Producto'],['Marketing','Marketing'],['España','España'],['Europa','Europa']].map(([value,label])=>'<button data-topic="'+value+'" class="'+(ui.filters.topic===value?'active':'')+'" aria-pressed="'+(ui.filters.topic===value)+'">'+label+'</button>').join('')+'<span class="demo-filter-result" role="status">'+list.length+' de '+state.stories.length+' historias</span></div>'+
      (current?'<div class="radar-story-layout"><div class="radar-stories">'+list.map(item=>'<button class="story-card '+(current.id===item.id?'selected':'')+'" data-story="'+item.id+'" aria-label="Ver historia: '+html(item.title)+'" aria-pressed="'+(current.id===item.id)+'">'+badge(item)+'<div><small>'+html(item.lens)+' <span class="demo-case">EJEMPLO</span></small><h3>'+html(item.title)+'</h3><p>'+html(item.why)+'</p><div class="demo-story-meta"><small>'+date(item.published)+' · '+item.sourceCount+' fuentes de ejemplo</small><span class="tag">'+stateLabels[item.state]+'</span></div></div></button>').join('')+'</div>'+renderDetail(current)+'</div>':'<div class="empty bordered"><h3>Ninguna historia con estos filtros.</h3><p>Puedes volver a todos los ejemplos para seguir explorando.</p><button class="btn secondary" data-action="reset-filters">Restablecer filtros</button></div>')+'</section>';
  }
  function renderDetail(item) {
    return '<aside class="story-detail demo-detail" aria-label="Detalle de historia"><div class="demo-detail-top"><span class="tiny-label">TU PUNTO DE PARTIDA</span>'+badge(item,true)+'</div><h2>'+html(ui.original?item.originalTitle:item.title)+'</h2><button class="text-link demo-translate" data-action="translate">'+(ui.original?'Volver al titular en español':'Ver titular original de ejemplo')+'</button><p>'+html(item.excerpt)+'</p><div class="demo-score-note"><strong>'+ (item.score===null?'Pendiente de puntuar':item.score<5?'Baja prioridad':item.score<7.5?'Interés medio':'Alta prioridad')+'</strong><p>'+html(item.why)+'</p></div>'+
      '<dl><dt>Contenido</dt><dd>'+number(item.content)+' / 10</dd><dt>Actualidad · Autoridad</dt><dd>'+number(item.freshness)+' · '+number(item.authority)+'</dd><dt>Objetivo sugerido</dt><dd>'+html(item.objective.charAt(0).toUpperCase()+item.objective.slice(1))+'</dd></dl><div class="demo-caution">'+icon('info',15)+'<span>'+html(item.caution)+'</span></div><h3>Desarrollo de la historia</h3><ol>'+item.timeline.map(text=>'<li><p>'+html(text)+'</p></li>').join('')+'</ol><h3>Fuente de ejemplo</h3><p class="demo-source-name">'+html(item.source)+'</p><div class="story-actions">'+
      (item.state==='descartada'?'<button class="btn accent" data-action="recover" data-id="'+item.id+'">Recuperar historia</button>':'<button class="btn accent" data-action="flash" data-id="'+item.id+'">Flash X</button><button class="btn secondary" data-action="analysis" data-id="'+item.id+'">Análisis</button><button class="btn secondary" data-action="later" data-id="'+item.id+'">Más tarde</button><button class="btn secondary" data-action="discard" data-id="'+item.id+'">Descartar</button>')+
      '<button class="text-link" data-action="score" data-id="'+item.id+'">'+(item.score===null?'Cargar puntuación de ejemplo':'Ver puntuación preparada')+'</button></div></aside>';
  }
  function renderDesk() {
    const pieces=state.pieces.filter(p=>!p.publishedAt);
    const chosen=state.stories.filter(item=>item.state==='elegida'&&!state.pieces.some(p=>p.storyId===item.id));
    return '<section aria-label="Mesa editorial"><div class="desk-intro"><div>'+icon('edit',25)+'<div><strong>Una idea, varias formas de contarla.</strong><p>Elige un canal, carga un borrador de ejemplo y hazlo tuyo.</p></div></div><span class="tag">'+pieces.length+' borradores</span></div><div class="demo-stage-guide">'+M.stages.map((stage,i)=>'<span><b>'+String(i+1).padStart(2,'0')+'</b> '+stage+(i<4?icon('right',12):'')+'</span>').join('')+'</div>'+
      (pieces.length?'<div class="desk-grid">'+pieces.map(entry=>{const item=M.story(state,entry.storyId);return '<article class="piece-card"><div class="piece-top"><span class="channel-badge">'+labels[entry.channel]+'</span><span class="tag">'+entry.status+'</span></div><h2>'+html(item.title)+'</h2><p class="piece-preview">'+html(entry.body)+'</p><div class="piece-footer"><small>Objetivo: '+entry.objective+' · Demo</small><button class="text-link" data-action="edit-piece" data-id="'+item.id+'" data-channel="'+entry.channel+'">Abrir editor '+icon('arrow',14)+'</button></div></article>';}).join('')+'</div>':'<div class="empty bordered"><h3>Tu próxima pieza empieza en una señal.</h3><p>Abre una historia del Radar y elige Flash X o Análisis.</p><button class="btn dark" data-nav="radar">Ir al Radar '+icon('arrow',15)+'</button></div>')+
      (chosen.length?'<div class="section-title lower"><h2>Elegidas para escribir</h2></div>'+chosen.map(item=>'<button class="chosen-row" data-action="edit-piece" data-id="'+item.id+'" data-channel="linkedin">'+icon('bookmark')+'<span><strong>'+html(item.title)+'</strong><small>'+html(item.source)+'</small></span>'+icon('right')+'</button>').join(''):'')+'</section>';
  }
  function renderPublished() {
    const all=state.pieces.filter(p=>p.publishedAt).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
    const entries=all.filter(entry=>(ui.publishedChannel==='all'||entry.channel===ui.publishedChannel)&&[M.story(state,entry.storyId).title,entry.body].join(' ').toLocaleLowerCase('es').includes(ui.publishedQuery.trim().toLocaleLowerCase('es')));
    return '<section aria-label="Archivo de publicaciones"><div class="desk-intro"><div>'+icon('check',25)+'<div><strong>'+all.length+' publicaciones de demostración</strong><p>Los ejemplos marcados como publicados aterrizan aquí. No se envían a ninguna red.</p></div></div></div><div class="search-row published-filters"><label class="search">'+icon('search',16)+'<input id="published-search" aria-label="Buscar publicaciones" data-published-search value="'+html(ui.publishedQuery)+'" placeholder="Buscar por noticia o texto…"></label><select aria-label="Canal de publicación" data-published-channel>'+options([['all','Todos los canales'],['linkedin','LinkedIn'],['flash','Flash X'],['web','Archivo web']],ui.publishedChannel)+'</select></div><p class="published-count" role="status">'+entries.length+' de '+all.length+' publicaciones</p>'+
      (entries.length?'<div class="desk-grid published-grid">'+entries.map(entry=>'<article class="piece-card published-card"><div class="piece-top"><span class="channel-badge">'+labels[entry.channel]+'</span><span class="tag primary-tag">'+icon('check',12)+' Publicada · demo</span></div><h2>'+html(M.story(state,entry.storyId).title)+'</h2><time datetime="'+html(entry.publishedAt)+'">'+date(entry.publishedAt)+' · Madrid</time><p class="piece-preview">'+html(entry.body)+'</p><details class="published-text"><summary>Leer texto guardado</summary><div>'+html(entry.body)+'</div></details><div class="published-actions"><button class="btn dark" data-action="read-piece" data-id="'+entry.id+'">'+icon('eye',15)+' Ver publicación de ejemplo</button><button class="btn secondary" data-action="copy-piece" data-id="'+entry.id+'">'+icon('copy',15)+' Copiar texto</button></div></article>').join('')+'</div>':'<div class="empty bordered"><h3>No hay publicaciones con estos filtros.</h3><button class="btn secondary" data-action="reset-published">Restablecer filtros</button></div>')+'</section>';
  }
  function renderSources() {
    const names=Array.from(new Set(state.stories.map(item=>item.source)));
    return '<section aria-label="Fuentes de ejemplo"><div class="notice-panel">'+icon('rss',22)+'<div><strong>El criterio empieza en el origen.</strong><p>Estas fuentes son ficticias y muestran cómo se organiza el radar. Puedes abrir sus historias de ejemplo.</p></div></div><div class="source-table">'+names.map((name,index)=>{const stories=state.stories.filter(s=>s.source===name);return '<article class="source-row"><span class="source-logo">'+String(index+1).padStart(2,'0')+'</span><div class="source-info"><h3>'+html(name)+'</h3><p class="demo-source-caption">'+(stories[0].kind==='primary'?'Fuente primaria':'Medio secundario')+' · '+stories.length+' historias ficticias</p></div><div class="source-health"><span class="health neutral"><span class="status-dot"></span> Contenido de ejemplo</span><small>Sin lecturas en directo</small></div><button class="text-link" data-source="'+html(name)+'">Ver historias '+icon('arrow',14)+'</button></article>';}).join('')+'</div></section>';
  }
  function renderSettings() {
    return '<section aria-label="Ajustes de la demo"><div class="two-columns"><div class="info-card settings-card"><span class="tiny-label">TU ATENCIÓN TIENE UN LÍMITE</span><h2>Decide qué merece pasar.</h2><p>El umbral de prioridad cambia qué historias aparecen al activar «Alta prioridad» en el Radar.</p><label for="threshold">Umbral de prioridad <strong id="threshold-value">'+number(state.threshold)+' / 10</strong></label><input type="range" id="threshold" min="0" max="10" step="0.1" value="'+state.threshold+'"><button class="btn dark" data-action="save-threshold">Guardar umbral de la demo</button><small>Este ajuste afecta solo a los ejemplos de este navegador.</small></div><div class="info-card"><span class="tiny-label">UN ESPACIO PARA PROBAR</span><h2>Explora sin compromiso.</h2><p>Puedes cargar puntuaciones, elegir historias, retocar textos y recorrer el archivo de Publicadas. Los borradores de la demo se conservan al volver a abrirla en este navegador.</p><div class="connection-row">'+icon('eye',20)+'<div><strong>Datos ficticios</strong><small>No estás entrando en el espacio privado del autor.</small></div></div><div class="connection-row">'+icon('edit',20)+'<div><strong>Textos de ejemplo</strong><small>Los resultados de demostración ya están preparados.</small></div></div><div class="connection-row">'+icon('shield',20)+'<div><strong>Publicación simulada</strong><small>Nada se envía ni se publica fuera de esta demo.</small></div></div><button class="btn secondary demo-reset-button" data-action="reset">'+icon('reset',15)+' Volver al punto de partida</button></div></div></section>';
  }
  function dialogShell(content,wide) {
    let modal=document.getElementById('demo-dialog');
    if(!modal){dialogs.innerHTML='<dialog class="modal'+(wide?' wide':'')+'" id="demo-dialog" aria-labelledby="dialog-title"></dialog>';modal=document.getElementById('demo-dialog');modal.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});}
    modal.className='modal'+(wide?' wide':''); modal.innerHTML=content;
    if(!modal.open)modal.showModal();
    return modal;
  }
  function closeButton(){return '<button class="icon-btn" data-action="close-dialog" aria-label="Cerrar">'+icon('close',20)+'</button>';}
  function closeDialog() {
    if(ui.editor&&ui.editor.changed&&ui.editor.body.trim()){try{saveEditor(false);}catch(error){notify(error.message);}}
    const modal=document.getElementById('demo-dialog');if(modal)modal.close();dialogs.innerHTML='';ui.editor=null;render();
  }
  function openEditor(id,channel) {
    if(ui.editor&&ui.editor.changed&&ui.editor.body.trim())saveEditor(false);
    const item=M.story(state,id); if(!item||!M.channels.includes(channel))return;
    M.setState(state,id,'elegida');persist();
    const entry=M.piece(state,id,channel);
    ui.editor={id:id,channel:channel,body:entry?entry.body:'',objective:entry?entry.objective:item.objective,changed:false};
    renderEditor();render();
  }
  function editorStage() {
    const editor=ui.editor, entry=M.piece(state,editor.id,editor.channel);
    if(entry&&entry.publishedAt)return 'Publicada';
    if(!editor.body.trim())return 'Elegida';
    return editor.body===M.sample(state,editor.id,editor.channel,D.samples)?'Base lista':'Retocada';
  }
  function stageMarkup(){const active=editorStage();return M.stages.map(stage=>'<span class="'+(stage===active?'active':'')+'"'+(stage===active?' aria-current="step"':'')+'>'+stage+'</span>').join('');}
  function renderEditor() {
    const editor=ui.editor,item=M.story(state,editor.id),entry=M.piece(state,editor.id,editor.channel);
    dialogShell('<div class="modal-header"><span class="tiny-label">MESA EDITORIAL · DEMO</span>'+closeButton()+'</div><h2 id="dialog-title">Una idea con <em>tu voz.</em></h2><p class="modal-sub">Carga el texto preparado para esta historia, retócalo y sigue el recorrido.</p><div class="demo-editor-stages" id="editor-stages" aria-label="Estado editorial">'+stageMarkup()+'</div><div class="editor-tabs" role="group" aria-label="Canal de la pieza">'+M.channels.map(channel=>'<button class="'+(channel===editor.channel?'active':'')+'" data-editor-channel="'+channel+'" aria-pressed="'+(channel===editor.channel)+'">'+labels[channel]+'</button>').join('')+'</div><div class="editor-scroll"><div class="editor-layout"><div><div class="editor-source"><span class="tiny-label">HISTORIA DE EJEMPLO</span><h3>'+html(item.title)+'</h3><p>'+html(item.source)+'</p></div><div class="demo-editor-options"><label for="objective">Objetivo de esta pieza<select id="objective">'+options([['atraer','Atraer'],['nutrir','Nutrir'],['convertir','Convertir']],editor.objective)+'</select></label><button class="btn accent" data-action="load-sample">'+icon('spark',15)+' Cargar borrador de ejemplo</button></div><label class="write-label" for="draft-body">Tu texto <span id="char-count">'+editor.body.length+' caracteres'+(editor.channel==='flash'?' · referencia 280':'')+'</span></label><textarea class="writing-area" id="draft-body" maxlength="24000" placeholder="Carga el borrador de ejemplo o escribe tu propia versión…">'+html(editor.body)+'</textarea><p class="demo-editor-note">'+icon('info',13)+' El texto es ficticio. Los cambios se guardan al pulsar Guardar o cerrar el editor.</p></div><aside class="voice-guide"><span class="tiny-label">LA PERSPECTIVA LA PONES TÚ</span><h3>Una idea.<br>Una consecuencia.<br>Tu criterio.</h3><p>El borrador abre el trabajo. Tu revisión decide dónde pone el foco la pieza.</p><ul><li>Empieza por lo que cambia.</li><li>Explica qué significa para el lector.</li><li>Distingue una afirmación de su evidencia.</li><li>Recorta lo que no añade información.</li></ul><div class="not-connected">'+icon('eye',15)+'<div><strong>Recorrido de demostración</strong><p>Marcar «Publicada» añade la pieza al archivo de esta demo. No se publica en redes.</p></div></div></aside></div></div><div class="modal-actions editor-actions"><span class="save-state" id="save-state">'+(entry?'Guardado en esta demo':'Todavía no has guardado una pieza')+'</span><div><button class="btn secondary" data-action="copy-draft">'+icon('copy',14)+' Copiar</button><button class="btn dark" data-action="save-draft">Guardar borrador</button></div></div><div class="publication-foot"><span>El recorrido completo termina en tu archivo de Publicadas.</span><button class="text-link" data-action="publish-draft">'+(entry&&entry.publishedAt?'Ver en Publicadas':'Marcar publicada · demo')+' '+icon('arrow',14)+'</button></div>',true);
  }
  function saveEditor(showMessage) {
    const e=ui.editor;
    const entry=M.savePiece(state,e.id,e.channel,e.body,e.objective,M.sample(state,e.id,e.channel,D.samples));
    const stored=persist();e.changed=false;
    const label=document.getElementById('save-state');if(label)label.textContent=stored?'Guardado en este navegador':'Guardado durante esta visita';
    const stages=document.getElementById('editor-stages');if(stages)stages.innerHTML=stageMarkup();
    if(showMessage)notify(stored?'Borrador de ejemplo guardado en este navegador.':'Borrador guardado durante esta visita.');
    return entry;
  }
  function showAbout() {
    ui.editor=null;
    dialogShell('<div class="modal-header"><span class="tiny-label">EL RECORRIDO</span>'+closeButton()+'</div><h2 id="dialog-title">De una señal a una pieza.</h2><p class="modal-sub">Kajón reúne las historias, ayuda a priorizarlas y mantiene el trabajo editorial en un solo lugar.</p><ol class="demo-tour"><li><strong>Explora el Radar.</strong><p>Abre una historia, revisa el porqué de su puntuación y filtra por tema o prioridad.</p></li><li><strong>Elige qué merece tu tiempo.</strong><p>Usa Flash X o Análisis para llevar la historia al editor. También puedes dejarla para después.</p></li><li><strong>Haz tuyo el borrador.</strong><p>Carga un texto preparado, cambia el canal, revisa el objetivo y retoca la pieza.</p></li><li><strong>Conserva lo que terminas.</strong><p>Guarda tu versión y márcala como publicada para verla en el archivo de esta demo.</p></li></ol><p class="demo-caution">Todos los casos y resultados son ficticios. Esta visita no accede a un espacio personal ni publica nada fuera de la demo.</p><div class="modal-actions"><button class="btn accent" data-action="start-tour">Probar con una historia '+icon('arrow',15)+'</button></div>',false);
  }
  async function copy(text) {
    if(!text.trim()){notify('Carga un borrador de ejemplo o escribe un texto antes de copiar.');return;}
    try {await navigator.clipboard.writeText(text);notify('Texto de ejemplo copiado.');}
    catch(_){notify('Selecciona el texto del editor o de «Leer texto guardado» para copiarlo.');}
  }
  async function handleClick(event) {
    const target=event.target.closest('button,a');if(!target)return;
    try{
      if(target.dataset.nav){event.preventDefault();setView(target.dataset.nav);return;}
      if(target.dataset.status){ui.filters.status=target.dataset.status;render();return;}
      if(target.dataset.topic){ui.filters.topic=target.dataset.topic;render();return;}
      if(target.dataset.story){ui.selected=target.dataset.story;ui.original=false;render();if(window.matchMedia('(max-width: 900px)').matches)document.querySelector('.demo-detail').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
      if(target.dataset.source){ui.filters=defaults();ui.filters.query=target.dataset.source;setView('radar');return;}
      if(target.dataset.editorChannel){openEditor(ui.editor.id,target.dataset.editorChannel);return;}
      const action=target.dataset.action,id=target.dataset.id;
      if(action==='about')showAbout();
      else if(action==='start-tour'){closeDialog();setView('radar');ui.filters=defaults();ui.selected='demo-01';render();openEditor('demo-01','linkedin');}
      else if(action==='close-dialog')closeDialog();
      else if(action==='reset'){ui.editor=null;dialogShell('<div class="modal-header"><span class="tiny-label">VOLVER A EMPEZAR</span>'+closeButton()+'</div><h2 id="dialog-title">¿Reiniciar esta demo?</h2><p class="modal-sub">Se borrarán únicamente los cambios que hayas hecho en esta demostración y volverán los ejemplos iniciales.</p><div class="modal-actions"><button class="btn secondary" data-action="close-dialog">Seguir explorando</button><button class="btn accent" data-action="confirm-reset">Reiniciar demo</button></div>',false);}
      else if(action==='confirm-reset'){state=M.reset(storage,D.seed);ui.filters=defaults();ui.selected='demo-01';ui.publishedQuery='';ui.publishedChannel='all';closeDialog();setView('radar');notify('Demo reiniciada. Puedes empezar de nuevo.');}
      else if(action==='reset-filters'){ui.filters=defaults();render();}
      else if(action==='reset-published'){ui.publishedQuery='';ui.publishedChannel='all';render();}
      else if(action==='score-all'){state.stories.forEach(item=>M.score(state,item.id));persist();render();notify('Puntuaciones de ejemplo cargadas. Ninguna historia se ha consultado en directo.');}
      else if(action==='score'){M.score(state,id);persist();render();notify('Puntuación preparada para este ejemplo: '+number(M.story(state,id).score)+' / 10.');}
      else if(action==='translate'){ui.original=!ui.original;render();}
      else if(['later','discard','recover'].includes(action)){M.setState(state,id,{later:'mas_tarde',discard:'descartada',recover:'detectada'}[action]);persist();render();notify(action==='later'?'Historia guardada para más tarde.':action==='discard'?'Historia movida a Descartadas. Puedes recuperarla.':'Historia recuperada en el Radar.');}
      else if(action==='flash'||action==='analysis')openEditor(id,action==='flash'?'flash':'linkedin');
      else if(action==='edit-piece')openEditor(id,target.dataset.channel);
      else if(action==='load-sample'){ui.editor.body=M.sample(state,ui.editor.id,ui.editor.channel,D.samples);ui.editor.changed=true;renderEditor();notify('Borrador de ejemplo cargado. Ya puedes retocarlo.');document.getElementById('draft-body').focus();}
      else if(action==='save-draft'){saveEditor(true);render();}
      else if(action==='copy-draft')await copy(ui.editor.body);
      else if(action==='publish-draft'){saveEditor(false);M.publish(state,ui.editor.id,ui.editor.channel);persist();ui.editor.changed=false;closeDialog();setView('published');notify('Pieza añadida a Publicadas en esta demo. No se ha enviado a ninguna red.');}
      else if(action==='copy-piece'){const entry=state.pieces.find(p=>p.id===id);if(entry)await copy(entry.body);}
      else if(action==='read-piece'){const entry=state.pieces.find(p=>p.id===id);if(entry)dialogShell('<div class="modal-header"><span class="tiny-label">'+labels[entry.channel]+' · PUBLICACIÓN DE EJEMPLO</span>'+closeButton()+'</div><h2 id="dialog-title">'+html(M.story(state,entry.storyId).title)+'</h2><p class="modal-sub">'+date(entry.publishedAt)+' · Ficticia, sin publicación externa.</p><div class="demo-read-text">'+html(entry.body)+'</div><div class="modal-actions"><button class="btn secondary" data-action="copy-piece" data-id="'+entry.id+'">'+icon('copy',14)+' Copiar texto</button><button class="btn dark" data-action="close-dialog">Cerrar</button></div>',false);}
      else if(action==='save-threshold'){state.threshold=Number(document.getElementById('threshold').value);persist();notify('Umbral de la demo guardado: '+number(state.threshold)+' / 10.');}
    }catch(error){notify(error.message||'No se pudo completar la acción de ejemplo.');}
  }
  function keepInputFocus(input,fn) {
    const id=input.id,start=input.selectionStart,end=input.selectionEnd;fn();render();
    const next=document.getElementById(id);if(next){next.focus({preventScroll:true});if(typeof start==='number')next.setSelectionRange(start,end);}
  }
  app.addEventListener('click',handleClick);dialogs.addEventListener('click',handleClick);
  app.addEventListener('input',event=>{const target=event.target;if(target.dataset.filter==='query')keepInputFocus(target,()=>{ui.filters.query=target.value;});else if(target.hasAttribute('data-published-search'))keepInputFocus(target,()=>{ui.publishedQuery=target.value;});else if(target.id==='threshold')document.getElementById('threshold-value').textContent=number(Number(target.value))+' / 10';});
  app.addEventListener('change',event=>{const target=event.target;if(target.dataset.filter){ui.filters[target.dataset.filter]=target.value;render();}else if(target.hasAttribute('data-published-channel')){ui.publishedChannel=target.value;render();}});
  dialogs.addEventListener('input',event=>{const target=event.target;if(target.id==='draft-body'&&ui.editor){ui.editor.body=target.value;ui.editor.changed=true;document.getElementById('char-count').textContent=target.value.length+' caracteres'+(ui.editor.channel==='flash'?' · referencia 280':'');document.getElementById('save-state').textContent='Cambios en tu versión de ejemplo';document.getElementById('editor-stages').innerHTML=stageMarkup();}});
  dialogs.addEventListener('change',event=>{if(event.target.id==='objective'&&ui.editor){ui.editor.objective=event.target.value;ui.editor.changed=true;}});
  window.addEventListener('hashchange',()=>{const view=location.hash.slice(1);if(nav.some(item=>item[0]===view)){ui.view=view;render();}});
  const requestedView=location.hash.slice(1);if(nav.some(item=>item[0]===requestedView))ui.view=requestedView;
  render();
})();
