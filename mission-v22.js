(()=>{'use strict';
const $=id=>document.getElementById(id), PREFIX='wfb-droid-tycoon-v3-', D=window.TRACKER_DATA||{};
const kinds={droids:{label:'Droiden',items:D.droids||[],url:'droids.html'},fusionen:{label:'Fusionen',items:D.fusionDroids||[],url:'fusionen.html'},icons:{label:'Ikonen',items:D.icons||[],url:'ikonen.html'}};
let key=PREFIX+'missions-guest',missions=[];
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
const getMissions=()=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch{return []}};
const save=()=>localStorage.setItem(key,JSON.stringify(missions));
function count(kind){if(kind==='all')return Object.keys(kinds).reduce((sum,k)=>sum+count(k),0);const {items}=kinds[kind];const state=read(PREFIX+kind);return items.reduce((sum,it,i)=>{const root=it.name+'#'+i;const found=kind==='icons'?!!state[root]:(D.variants||[]).some(v=>!!state[root+'|'+v]);return sum+(found?1:0)},0)}
function periodEnd(period){const now=new Date();if(period==='today'){const d=new Date(now);d.setHours(23,59,59,999);return d.getTime()}if(period==='week'){const d=new Date(now);d.setDate(d.getDate()+((7-d.getDay())%7));d.setHours(23,59,59,999);return d.getTime()}return null}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function draw(){const active=$('mc-active'),archive=$('mc-archive');active.replaceChildren();archive.replaceChildren();let changed=false;
for(const m of missions){if(!m.status){const gain=Math.max(0,count(m.kind)-m.baseline);if(gain>=m.target){m.status='done';m.finished=Date.now();changed=true}else if(m.deadline&&Date.now()>m.deadline){m.status='expired';m.finished=Date.now();changed=true}}}
if(changed)save();let a=0,b=0;for(const m of missions.slice().reverse()){
const done=m.status==='done',expired=m.status==='expired',archived=done||expired;
if(archived)b++;else a++;
const progress=done?m.target:Math.min(m.target,Math.max(0,count(m.kind)-m.baseline));const card=el('article','mc-card'+(archived?' mc-archived':''));
const top=el('div','mc-card-head'),name=el('strong','',m.title),badge=el('span','mc-pill',done?'✓ ABGESCHLOSSEN':expired?'ZEIT ABGELAUFEN':m.period==='today'?'HEUTE':m.period==='week'?'DIESE WOCHE':'OHNE LIMIT');top.append(name,badge);card.append(top);
card.append(el('p','mc-sub', (m.kind==='all'?'Alle Sammlungen':kinds[m.kind]?.label||'Sammlung')+' · '+progress+' von '+m.target+' neuen Einträgen'));
const track=el('div','mc-track'),fill=el('div','mc-fill');fill.style.width=(100*progress/m.target)+'%';track.append(fill);card.append(track);
const actions=el('div','mc-actions');if(!archived){const link=el('a','mc-button mc-small','SAMMLUNG ÖFFNEN ↗');link.href=m.kind==='all'?'./index.html':'./'+kinds[m.kind].url;actions.append(link)}
const remove=el('button','mc-danger', 'LÖSCHEN');remove.type='button';remove.addEventListener('click',()=>{if(confirm('Mission wirklich löschen?')){missions=missions.filter(x=>x.id!==m.id);save();draw()}});actions.append(remove);card.append(actions);(archived?archive:active).append(card)}
$('mc-active-count').textContent=a+' aktiv';$('mc-archive-count').textContent=b+' archiviert';$('mc-summary').textContent=a+' aktive Missionen  ·  '+missions.filter(m=>m.status==='done').length+' abgeschlossen';if(!a)active.append(el('p','mc-empty','Noch keine aktive Mission. Starte oben mit einem Sammelziel!'));if(!b)archive.append(el('p','mc-empty','Abgeschlossene und abgelaufene Missionen erscheinen hier.'))}
function create(title,kind,target,period){const baseline=count(kind),max=kind==='all'?Object.values(kinds).reduce((a,k)=>a+k.items.length,0):kinds[kind].items.length;if(target<1||!Number.isInteger(target)||target>999){alert('Bitte eine gültige Zielzahl zwischen 1 und 999 eingeben.');return}if(target>max-baseline){alert('Es gibt nur '+(max-baseline)+' noch fehlende Einträge in dieser Sammlung.');return}missions.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),title:title.trim(),kind,target,period,baseline,deadline:periodEnd(period),created:Date.now(),status:''});save();draw()}
$('mc-form').addEventListener('submit',e=>{e.preventDefault();create($('mc-title').value,$('mc-kind').value,Number($('mc-target').value),$('mc-period').value);$('mc-title').value=''});
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const [kind,n,period]=b.dataset.preset.split(':');create(n+' neue '+kinds[kind].label+' sammeln',kind,Number(n),period)}));
async function init(){try{if(window.supabase){const c=window.supabase.createClient('https://mmitxiaidgvifxzqqrae.supabase.co','sb_publishable_LPRZBZLoQsPm_P2olo7ESA_EYK3f_Cu');const {data}=await c.auth.getUser();if(data?.user?.id)key=PREFIX+'missions-user-'+data.user.id}}catch{}missions=getMissions();draw();window.addEventListener('storage',e=>{if(e.key===key)missions=getMissions();draw()});window.addEventListener('focus',draw);document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw()});setInterval(draw,15000)}
init();})();