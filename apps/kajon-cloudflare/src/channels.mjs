export const CHANNELS = [
{id:'linkedin',name:'LinkedIn',mark:'in',color:'#1766b5',focus:'Autoridad y conversaciones B2B',native:true,hosts:['linkedin.com','www.linkedin.com'],note:'OAuth de perfil. Las estadísticas requieren r_member_postAnalytics y acceso aprobado de la aplicación.'},
{id:'x',name:'X',mark:'𝕏',color:'#18191c',focus:'Tesis, actualidad y conversación',native:true,hosts:['x.com','www.x.com','twitter.com','www.twitter.com'],note:'OAuth con PKCE. Lectura sujeta a permisos y acceso a la API de X.'},
{id:'instagram',name:'Instagram',mark:'ig',color:'#bc377e',focus:'Historias visuales y comunidad',native:false,hosts:['instagram.com','www.instagram.com'],note:'Registro, borradores y métricas manuales. Adaptador Meta pendiente.'},
{id:'facebook',name:'Facebook',mark:'f',color:'#2373da',focus:'Páginas y comunidades',native:false,hosts:['facebook.com','www.facebook.com'],note:'Registro manual. Integración de páginas pendiente; no se promete acceso a perfiles personales.'},
{id:'threads',name:'Threads',mark:'@',color:'#3f3f46',focus:'Ideas y conversación',native:false,hosts:['threads.net','www.threads.net','threads.com','www.threads.com'],note:'Registro manual. OAuth y adaptador Threads pendientes.'},
{id:'youtube',name:'YouTube',mark:'▶',color:'#d33d3d',focus:'Profundidad, vídeo y búsqueda',native:false,hosts:['youtube.com','www.youtube.com','youtu.be'],note:'Registro manual de vídeos y métricas. OAuth y APIs pendientes.'},
{id:'tiktok',name:'TikTok',mark:'♪',color:'#196975',focus:'Descubrimiento en vídeo',native:false,hosts:['tiktok.com','www.tiktok.com'],note:'Registro manual. OAuth, permisos y adaptador pendientes.'},
{id:'bluesky',name:'Bluesky',mark:'b',color:'#357df2',focus:'Conversación en red abierta',native:false,hosts:['bsky.app'],note:'Registro manual. OAuth y adaptador AT Protocol pendientes.'}
];
export const channelById=id=>CHANNELS.find(c=>c.id===id);
export function connectionPresentation(record,configured=false){if(!record)return{label:configured?'Listo para autorizar':'Sin conectar',tone:configured?'amber':'base'};if(record.status==='expired')return{label:'Renovar autorización',tone:'amber'};if(record.status==='error')return{label:'Revisar conexión',tone:'red'};return{label:record.last_metrics_at?'Métricas verificadas':'Cuenta autorizada',tone:'green'};}
