(function (root) {
  'use strict';
  const STORAGE_KEY = 'kajon.public-demo.v1';
  const states = ['detectada', 'elegida', 'mas_tarde', 'descartada'];
  const stages = ['Detectada', 'Elegida', 'Base lista', 'Retocada', 'Publicada'];
  const channels = ['flash', 'linkedin', 'web'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const color = score => score === null ? 'grey' : score < 5 ? 'red' : score < 7.5 ? 'orange' : 'green';
  const story = (state, id) => state.stories.find(item => item.id === id);
  const piece = (state, id, channel) => state.pieces.find(item => item.storyId === id && item.channel === channel);
  function load(storage, seed) {
    const state = clone(seed);
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return state;
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !Array.isArray(saved.stories) || !Array.isArray(saved.pieces)) return state;
      state.stories.forEach(item => {
        const match = saved.stories.find(value => value && value.id === item.id);
        if (match && states.includes(match.state)) item.state = match.state;
        if (match && match.score === item.sampleScore) item.score = match.score;
      });
      state.pieces = saved.pieces.filter(value => value && typeof value.storyId === 'string' && story(state, value.storyId) && channels.includes(value.channel) && typeof value.body === 'string' && value.body.length <= 24000 && stages.includes(value.status)).slice(0,24).map(value => ({
        id: 'piece-' + value.storyId + '-' + value.channel,
        storyId: value.storyId, channel: value.channel, body: value.body,
        status: value.status, objective: ['atraer','nutrir','convertir'].includes(value.objective) ? value.objective : 'nutrir',
        publishedAt: value.status === 'Publicada' ? (Number.isFinite(Date.parse(value.publishedAt)) ? new Date(value.publishedAt).toISOString() : state.referenceNow) : null,
        updatedAt: Number.isFinite(Date.parse(value.updatedAt)) ? new Date(value.updatedAt).toISOString() : state.referenceNow
      }));
      if (typeof saved.threshold === 'number' && saved.threshold >= 0 && saved.threshold <= 10) state.threshold = saved.threshold;
    } catch (_) { /* A blocked or malformed local store never prevents the demo opening. */ }
    return state;
  }
  function persist(storage, state) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch (_) { return false; }
  }
  function reset(storage, seed) {
    try { storage.removeItem(STORAGE_KEY); } catch (_) { /* Memory mode remains usable. */ }
    return clone(seed);
  }
  function visible(state, filters) {
    const f = Object.assign({status:'active',kind:'all',period:'all',query:'',topic:'all',priority:'all'}, filters);
    const query = f.query.trim().toLocaleLowerCase('es');
    return state.stories.filter(item => {
      const age = Date.parse(state.referenceNow) - Date.parse(item.published);
      return (f.status === 'active' ? item.state !== 'descartada' : item.state === f.status)
        && (f.kind === 'all' || item.kind === f.kind)
        && (f.period !== '24' || (age >= 0 && age <= 86400000))
        && (f.topic === 'all' || item.tags.includes(f.topic))
        && (f.priority !== 'high' || (item.score !== null && item.score >= state.threshold))
        && (!query || [item.title,item.originalTitle,item.excerpt,item.source,item.tags.join(' ')].join(' ').toLocaleLowerCase('es').includes(query));
    }).sort((a,b) => (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score) || Date.parse(b.published) - Date.parse(a.published));
  }
  function setState(state,id,next) {
    if (!states.includes(next)) throw Error('Estado no válido.');
    const item = story(state,id);
    if (!item) throw Error('No se encuentra el ejemplo.');
    item.state = next;
  }
  function score(state,id) {
    const item = story(state,id);
    if (!item) throw Error('No se encuentra el ejemplo.');
    item.score = item.sampleScore;
    return item.score;
  }
  function sample(state,id,channel,samples) {
    const item = story(state,id);
    if (!item || !channels.includes(channel)) throw Error('Ejemplo o canal no válido.');
    if (samples[id] && samples[id][channel]) return samples[id][channel];
    if (channel === 'flash') return 'Una historia merece atención cuando permite explicar una consecuencia concreta. En este ejemplo, la pregunta útil es qué cambia para la persona que hace el trabajo. [Caso ficticio de demostración.]';
    return item.title + '\n\n' + item.excerpt + '\n\n' + item.why + '\n\nAntes de sacar conclusiones, hace falta definir qué se quiere observar y qué evidencia permitiría comprobarlo.\n\n¿Qué detalle de este caso revisarías primero?\n\n[Texto de demostración. La historia es ficticia y no se ha publicado en ninguna red.]';
  }
  function savePiece(state,id,channel,body,objective,sampleText) {
    const item = story(state,id);
    if (!item || !channels.includes(channel)) throw Error('Ejemplo o canal no válido.');
    if (typeof body !== 'string' || !body.trim()) throw Error('Escribe algo o carga el borrador de ejemplo.');
    if (body.length > 24000) throw Error('El ejemplo admite hasta 24.000 caracteres.');
    let entry = piece(state,id,channel);
    if (!entry) {
      entry = {id:'piece-'+id+'-'+channel,storyId:id,channel:channel,publishedAt:null};
      state.pieces.push(entry);
    }
    entry.body = body;
    entry.status = entry.publishedAt ? 'Publicada' : body === sampleText ? 'Base lista' : 'Retocada';
    entry.objective = ['atraer','nutrir','convertir'].includes(objective) ? objective : 'nutrir';
    entry.updatedAt = state.referenceNow;
    item.state = 'elegida';
    return entry;
  }
  function publish(state,id,channel) {
    const entry = piece(state,id,channel);
    if (!entry || !entry.body.trim()) throw Error('Guarda un borrador antes de marcarlo como publicado.');
    entry.status = 'Publicada';
    entry.publishedAt = state.referenceNow;
    entry.updatedAt = state.referenceNow;
    return entry;
  }
  root.KajonModel = {STORAGE_KEY,stages,channels,clone,escape,color,story,piece,load,persist,reset,visible,setState,score,sample,savePiece,publish};
})(globalThis);
