const STORE='wfb-droid-tycoon-v3';
const D=window.TRACKER_DATA;

const RARITY_COLORS={
  'GEWÖHNLICH':'#D9F2D0','SELTEN':'#C1E4F5','EPISCH':'#CC99FF',
  'LEGENDÄR':'#FF9933','MYTISCH':'#FF66CC'
};
const TYPE_COLORS={
  'Arbeiter':'#8ED873','Astromech':'#9966FF','Kampf':'#FF0000','Protokoll':'#FFFF00'
};
const VARIANT_COLORS={
  'BASIS':'#F2F2F2','GOLD':'#FFFF99','DIAMANT':'#CAEDFB','RAINBOW':'#FFCCFF',
  'BESKAR':'#AEAEAE','GALAKTISCH':'#9966FF','STELLAR':'#FFFF00',
  'KYBER INAKT':'#7F7F7F','KYBER GRÜN':'#84E291','KYBER BLAU':'#83CAEB',
  'KYBER LILA':'#D76DCC','MAKELLOS':'#EAEAEA'
};

const slug=s=>String(s).toUpperCase().replaceAll(' ','-').replaceAll('Ä','AE').replaceAll('Ö','OE').replaceAll('Ü','UE');
function setupNav(page){
  document.querySelectorAll('[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
}
function stateLoad(key){
  try{return JSON.parse(localStorage.getItem(STORE+'-'+key)||'{}')}catch{return {}}
}
function stateSave(key,s){
  localStorage.setItem(STORE+'-'+key,JSON.stringify(s));
}
function recordActivity(category,label,checked){
  if(!checked) return;
  try{
    const key=STORE+'-activity', list=JSON.parse(localStorage.getItem(key)||'[]');
    list.unshift({category,label,time:Date.now()});
    localStorage.setItem(key,JSON.stringify(list.slice(0,20)));
  }catch{}
}
function exportProgress(){
  const keys=['droids','fusionen','icons','rebirth'];
  const payload={version:STORE,exportedAt:new Date().toISOString(),data:{}};
  keys.forEach(k=>payload.data[k]=stateLoad(k));
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='droid-tycoon-tracker-progress.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importProgress(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{try{
      const p=JSON.parse(r.result); if(!p||!p.data) throw new Error('Ungültige Datei');
      ['droids','fusionen','icons','rebirth'].forEach(k=>{if(p.data[k]&&typeof p.data[k]==='object')stateSave(k,p.data[k])});
      resolve(true);
    }catch(e){reject(e)}};
    r.onerror=()=>reject(r.error); r.readAsText(file);
  });
}
function formatActivityTime(ts){
  const d=new Date(ts), now=new Date(), diff=now-ts;
  if(diff<60000)return 'gerade eben'; if(diff<3600000)return Math.floor(diff/60000)+' Min. vor'; if(d.toDateString()===now.toDateString())return 'heute, '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function safeColor(c){return /^#[0-9A-F]{6}$/i.test(c)?c:'#ffffff'}
function badge(label,color,extra=''){
  if(!label)return '';
  return `<span class="color-badge ${extra}" style="--badge:${safeColor(color)}">${esc(label)}</span>`;
}
function getRarityColor(r){return RARITY_COLORS[String(r||'').toUpperCase()]||'#60758f'}
function getTypeColor(t){return TYPE_COLORS[t]||'#60758f'}
function getVariantColor(v){return VARIANT_COLORS[v]||'#60758f'}


function getTrackerProgress(key,items,variants){
  const state=stateLoad(key); let done=0;
  items.forEach((it,idx)=>variants.forEach(v=>{if(state[it.name+'#'+idx+'|'+v])done++;}));
  const total=items.length*variants.length, pct=total?Math.round(done/total*100):0;
  return {done,total,pct};
}

function getIconProgress(items){
  const state=stateLoad('icons');
  const done=items.filter((it,idx)=>state[it.name+'#'+idx]).length, total=items.length, pct=total?Math.round(done/total*100):0;
  return {done,total,pct};
}

function getRebirthProgress(){
  let done=0; const total=5*40;
  for(let cycle=1;cycle<=5;cycle++){
    const state=stateLoad('rebirth-c'+cycle);
    done+=Object.values(state).filter(Boolean).length;
  }
  return {done,total,pct:total?Math.round(done/total*100):0};
}

function setHomeProgress(prefix,p){
  const done=document.getElementById(prefix+'Done'), pct=document.getElementById(prefix+'Pct'), bar=document.getElementById(prefix+'Bar');
  if(done) done.textContent=`${p.done}/${p.total} ${prefix==='homeIkonen'?'Ikonen':prefix==='homeRebirth'?'Rebirths':'Varianten'}`;
  if(pct) pct.textContent=p.pct+'%';
  if(bar) bar.style.width=p.pct+'%';
}

function renderHomeProgress(){
  if(!document.getElementById('homeDroidsPct')) return;
  setHomeProgress('homeDroids',getTrackerProgress('droids',D.droids,D.variants));
  setHomeProgress('homeFusionen',getTrackerProgress('fusionen',D.fusionDroids,D.variants));
  setHomeProgress('homeIkonen',getIconProgress(D.icons));
  const ps=[getTrackerProgress('droids',D.droids,D.variants),getTrackerProgress('fusionen',D.fusionDroids,D.variants),getIconProgress(D.icons)];
  const rb=getRebirthProgress();
  const done=ps.reduce((a,p)=>a+p.done,0)+rb.done, total=ps.reduce((a,p)=>a+p.total,0)+rb.total, pct=total?Math.round(done/total*100):0;
  const chips={droids:document.getElementById('chipDroids'),fusion:document.getElementById('chipFusion'),icons:document.getElementById('chipIcons'),rebirth:document.getElementById('chipRebirth')};
  if(chips.droids)chips.droids.textContent=`🤖 Droiden ${ps[0].pct}%`; if(chips.fusion)chips.fusion.textContent=`⚡ Fusionen ${ps[1].pct}%`; if(chips.icons)chips.icons.textContent=`⭐ Ikonen ${ps[2].pct}%`; if(chips.rebirth)chips.rebirth.textContent=`🔄 Rebirth ${rb.pct}%`;
  const overallDone=document.getElementById('homeOverallDone'),overallPct=document.getElementById('homeOverallPct'),overallBar=document.getElementById('homeOverallBar');
  if(overallDone) overallDone.textContent=`${done}/${total} Einträge abgeschlossen`;
  if(overallPct) overallPct.textContent=pct+'%'; if(overallBar) overallBar.style.width=pct+'%';
  const open=document.getElementById('homeOverallOpen'); if(open) open.textContent=`Noch offen: ${total-done}`;
  renderAchievements(ps); renderActivity();
  if(document.getElementById('nextMission')) renderNextMission();
  if(document.getElementById('commanderStatus')) renderCommanderStatus();
}
function renderAchievements(ps){
  const el=document.getElementById('achievements'); if(!el)return;
  const [d,f,i]=ps; const allDone=p=>p.total>0&&p.done===p.total;
  const ach=[
    ['🏅','Erster Schritt','Den ersten Eintrag abgeschlossen',d.done+f.done+i.done>0],
    ['🤖','Droidensammler','50 Droid-Varianten abgeschlossen',d.done>=50],
    ['⚡','Fusion Master','Alle Fusionen abgeschlossen',allDone(f)],
    ['⭐','Ikonenjäger','Alle Ikonen gefunden',allDone(i)],
    ['🏆','Galaktischer Meister','Droids, Fusionen und Ikonen zu 100 %',allDone(d)&&allDone(f)&&allDone(i)]
  ];
  el.innerHTML=ach.map(a=>`<article class="achievement ${a[3]?'unlocked':''}"><span>${a[0]}</span><div><b>${a[1]}</b><small>${a[2]}</small></div>${a[3]?'<strong>✓</strong>':''}</article>`).join('');
}
function renderActivity(){
  const el=document.getElementById('recentActivity'); if(!el)return;
  try{const list=JSON.parse(localStorage.getItem(STORE+'-activity')||'[]');
    el.innerHTML=list.length?list.slice(0,6).map(x=>`<li><span>${esc(x.category)}</span><b>${esc(x.label)}</b><small>${formatActivityTime(x.time)}</small></li>`).join(''):'<li class="empty-activity">Noch keine neuen Abschlüsse in diesem Browser.</li>';
  }catch{el.innerHTML='<li class="empty-activity">Noch keine neuen Abschlüsse in diesem Browser.</li>'}
}

function renderTracker(kind,items,variants){
  const body=document.getElementById('trackerBody'), state=stateLoad(kind);
  const search=document.getElementById('search'), type=document.getElementById('type'), rarity=document.getElementById('rarity');
  const urlQ=new URLSearchParams(location.search).get('q');
  if(search && urlQ) search.value=urlQ;
  const hideComplete=document.getElementById('hideComplete');
  const hideMakellosOnly=document.getElementById('hideMakellosOnly');

  [...new Set(items.map(x=>x.type))].filter(Boolean).sort().forEach(x=>type.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));
  [...new Set(items.map(x=>x.rarity))].filter(Boolean).forEach(x=>rarity.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));

  function isComplete(it,idx){
    const key=it.name+'#'+idx;
    return variants.every(v=>state[key+'|'+v]);
  }
  function onlyMakellosMissing(it,idx){
    const key=it.name+'#'+idx;
    return variants.filter(v=>!state[key+'|'+v]).length===1 && !state[key+'|MAKELLOS'];
  }

  function render(){
    const q=search.value.toLowerCase().trim(), tv=type.value, rv=rarity.value;
    const shown=items.map((it,idx)=>({...it,idx})).filter(it=>{
      if(q && !it.name.toLowerCase().includes(q)) return false;
      if(tv!=='all' && it.type!==tv) return false;
      if(rv!=='all' && it.rarity!==rv) return false;
      if(hideComplete?.checked && isComplete(it,it.idx)) return false;
      if(hideMakellosOnly?.checked && onlyMakellosMissing(it,it.idx)) return false;
      return true;
    });

    body.innerHTML=shown.map(it=>{
      const key=it.name+'#'+it.idx;
      const done=isComplete(it,it.idx);
      return `<tr id="row-${slug(it.name)}" class="${done?'row-complete':''}">
        <td class="sticky droidcell">
          <div class="name">${esc(it.name)}</div>
          <div class="badges">
            ${badge(it.rarity,getRarityColor(it.rarity),'rarity-box')}
            ${badge(it.type,getTypeColor(it.type),'type-box')}
          </div>
        </td>
        ${variants.map(v=>`<td class="check-cell">
          <input aria-label="${esc(it.name)} ${esc(v)}" class="check" style="--vcolor:${getVariantColor(v)}" type="checkbox"
            data-key="${esc(key)}" data-v="${esc(v)}" ${state[key+'|'+v]?'checked':''}>
          <span class="check-label" style="--labelcolor:${getVariantColor(v)}">${esc(v)}</span>
        </td>`).join('')}
      </tr>`;
    }).join('');

    body.querySelectorAll('.check').forEach(cb=>cb.addEventListener('change',()=>{
      state[cb.dataset.key+'|'+cb.dataset.v]=cb.checked;
      if(cb.checked) recordActivity(kind==='droids'?'Droid':'Fusion',cb.dataset.key.split('#')[0]+' – '+cb.dataset.v,true);
      stateSave(kind,state); update(); render();
    }));
    update();
  }

  function update(){
    let total=items.length*variants.length, done=0;
    items.forEach((it,idx)=>variants.forEach(v=>{
      if(state[it.name+'#'+idx+'|'+v])done++;
    }));
    const pct=total?Math.round(done/total*100):0;
    document.getElementById('done').textContent=`${done}/${total}`;
    document.getElementById('pct').textContent=pct+'%';
    document.getElementById('bar').style.width=pct+'%';
    const visible=body.querySelectorAll('tr').length;
    const counter=document.getElementById('visibleCount');
    if(counter) counter.textContent=`${visible} von ${items.length} Droiden angezeigt`;
  }

  [search,type,rarity,hideComplete,hideMakellosOnly].filter(Boolean).forEach(x=>x.addEventListener('input',render));
  document.getElementById('reset').addEventListener('click',()=>{
    if(confirm('Wirklich den gesamten Fortschritt dieser Seite löschen?')){
      localStorage.removeItem(STORE+'-'+kind); location.reload();
    }
  });
  render();
}

function renderIcons(items){
  const body=document.getElementById('iconBody'), state=stateLoad('icons'), search=document.getElementById('search');
  const urlQ=new URLSearchParams(location.search).get('q'); if(search && urlQ) search.value=urlQ;
  const toolbar=document.querySelector('.toolbar');
  if(toolbar && !document.getElementById('hideComplete')){
    const label=document.createElement('label'); label.className='filter-check'; label.innerHTML='<input type="checkbox" id="hideComplete"><span>✓ GESICHERTE AUSBLENDEN</span>'; toolbar.insertBefore(label,document.getElementById('reset'));
  }
  const hideComplete=document.getElementById('hideComplete');
  function render(){
    const q=(search?.value||'').toLowerCase().trim();
    const shown=items.map((it,idx)=>({...it,idx})).filter(it=>{const checked=!!state[it.name+'#'+it.idx];return (!q||it.name.toLowerCase().includes(q))&&(!hideComplete?.checked||!checked)});
    body.innerHTML=shown.map(it=>{
      const key=it.name+'#'+it.idx, checked=!!state[key];
      return `<tr id="icon-${slug(it.name)}" class="${checked?'row-complete':''}"><td class="sticky droidcell"><div class="name">${esc(it.name)}</div><div class="badges">${badge(it.type,getTypeColor(it.type),'type-box')}</div></td><td class="check-cell"><input aria-label="${esc(it.name)} vorhanden" class="check" style="--vcolor:#11e8ff" type="checkbox" data-key="${esc(key)}" ${checked?'checked':''}><span class="check-label">VORHANDEN</span></td></tr>`;
    }).join('');
    body.querySelectorAll('.check').forEach(cb=>cb.addEventListener('change',()=>{state[cb.dataset.key]=cb.checked;if(cb.checked)recordActivity('Ikone',cb.dataset.key.split('#')[0],true);stateSave('icons',state);update();render();renderHomeProgress?.();}));
    update();
  }
  function update(){const done=items.filter((it,idx)=>state[it.name+'#'+idx]).length,total=items.length,pct=total?Math.round(done/total*100):0;document.getElementById('done').textContent=`${done}/${total}`;document.getElementById('pct').textContent=pct+'%';document.getElementById('bar').style.width=pct+'%';const vc=document.getElementById('visibleCount');if(vc)vc.textContent=`${body.querySelectorAll('tr').length} von ${total} Ikonen angezeigt`;}
  [search,hideComplete].filter(Boolean).forEach(x=>x.addEventListener('input',render));
  document.getElementById('reset').addEventListener('click',()=>{if(confirm('Wirklich den gesamten Ikonen-Fortschritt löschen?')){localStorage.removeItem(STORE+'-icons');location.reload()}});
  render();
}
function initChecklistUX(){
  const root=document.body; if(root.dataset.checklistUx==='1')return; root.dataset.checklistUx='1';
  const key=STORE+'-checklist-settings'; let cfg={};
  try{cfg=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  const compact=!!cfg.compact, collect=!!cfg.collect;
  root.classList.toggle('compact-checklists',compact); root.classList.toggle('collect-mode',collect);
  const toolbar=document.querySelector('.toolbar');
  if(toolbar){
    const b=document.createElement('button'); b.className='btn view-toggle'; b.type='button'; b.id='compactToggle'; b.textContent=compact?'▤ DETAILANSICHT':'▦ KOMPAKTANSICHT';
    toolbar.insertBefore(b,toolbar.querySelector('#reset')||null);
    b.addEventListener('click',()=>{const on=!root.classList.contains('compact-checklists');root.classList.toggle('compact-checklists',on);cfg.compact=on;localStorage.setItem(key,JSON.stringify(cfg));b.textContent=on?'▤ DETAILANSICHT':'▦ KOMPAKTANSICHT';});
    const c=document.createElement('button'); c.className='btn collect-toggle'; c.type='button'; c.id='collectToggle'; c.textContent=collect?'🔴 SAMMELMODUS AUS':'🟢 SAMMELMODUS';
    toolbar.insertBefore(c,toolbar.querySelector('#reset')||null);
    c.addEventListener('click',()=>{const on=!root.classList.contains('collect-mode');root.classList.toggle('collect-mode',on);cfg.collect=on;localStorage.setItem(key,JSON.stringify(cfg));c.textContent=on?'🔴 SAMMELMODUS AUS':'🟢 SAMMELMODUS';});
  }
}

function renderRecipes(recipes){
  const el=document.getElementById('recipes');
  el.innerHTML=recipes.map(r=>`<article class="recipe ${slug(r.rarity)}" style="--rc:${getRarityColor(r.rarity)}">
    ${badge(r.rarity,getRarityColor(r.rarity),'rarity-box')}
    ${badge(r.type,getTypeColor(r.type),'type-box')}
    <h3>${esc(r.name)}</h3>
    <div class="ingredients">${r.ingredients.map((x,i)=>`${i?'<span class="arrow">+</span>':''}<span class="ingredient">${esc(x)}</span>`).join('')}<span class="arrow">→</span><span class="ingredient">${esc(r.name)}</span></div>
  </article>`).join('');
}

function renderRebirthChecklists(){
  document.querySelectorAll('[data-rebirth-checklist]').forEach(grid=>{
    const cycle=Number(grid.dataset.rebirthChecklist), state=stateLoad('rebirth-c'+cycle);
    grid.innerHTML=Array.from({length:40},(_,i)=>{
      const n=i+1, checked=!!state[n];
      return `<label class="rebirth-check ${checked?'is-done':''}">
        <input class="check" style="--vcolor:#8ED873" type="checkbox" data-n="${n}" ${checked?'checked':''}>
        <span class="rebirth-check-num">${String(n).padStart(2,'0')}</span><span class="rebirth-check-mark">${checked?'✓':'□'}</span>
      </label>`;
    }).join('');
    grid.querySelectorAll('input').forEach(c=>c.addEventListener('change',()=>{
      state[c.dataset.n]=c.checked; stateSave('rebirth-c'+cycle,state); renderRebirthCycleSummary(cycle); renderHomeProgress(); renderWalDashboard(); renderCommanderStatus(); renderNextMission();
      c.closest('.rebirth-check')?.classList.toggle('is-done',c.checked);
      const mark=c.closest('.rebirth-check')?.querySelector('.rebirth-check-mark'); if(mark)mark.textContent=c.checked?'✓':'□';
    }));
    renderRebirthCycleSummary(cycle);
  });
}
function renderRebirthCycleSummary(cycle){
  const state=stateLoad('rebirth-c'+cycle), done=Object.values(state).filter(Boolean).length;
  const pct=Math.round(done/40*100);
  document.querySelectorAll(`[data-cycle-summary="${cycle}"]`).forEach(el=>el.textContent=`${done}/40 · ${pct}%`);
  document.querySelectorAll(`[data-cycle-bar="${cycle}"]`).forEach(el=>el.style.width=pct+'%');
}
function resetRebirthProgress(){
  if(!confirm('Wirklich alle Rebirth-Checklisten löschen?')) return;
  for(let c=1;c<=5;c++) localStorage.removeItem(STORE+'-rebirth-c'+c);
  location.reload();
}
function initRebirthPage(){
  if(!document.querySelector('[data-rebirth-checklist]'))return;
  renderRebirthChecklists();
  const reset=document.getElementById('resetRebirth'); if(reset)reset.addEventListener('click',resetRebirthProgress);
}



function getAllProgress(){
  const d=getTrackerProgress('droids',D.droids,D.variants), f=getTrackerProgress('fusionen',D.fusionDroids,D.variants), i=getIconProgress(D.icons), r=getRebirthProgress();
  return {d,f,i,r};
}
function getXpData(){
  const {d,f,i,r}=getAllProgress();
  const checked=d.done+f.done+i.done+r.done;
  const xp=checked*25 + Math.floor(d.done/10)*100 + Math.floor(f.done/10)*150 + Math.floor(i.done/5)*200 + Math.floor(r.done/5)*300;
  const level=Math.floor(xp/100)+1, into=xp%100;
  const ranks=[[0,'ANFÄNGER'],[10,'DROIDEN-SCOUT'],[30,'FUSIONS-TECHNIKER'],[50,'GALAXIE-SAMMLER'],[75,'DROID-TYCOON'],[100,'GALAKTISCHER MEISTER']];
  const pct=(d.done+f.done+i.done+r.done)/Math.max(1,d.total+f.total+i.total+r.total)*100;
  let rank='ANFÄNGER';ranks.forEach(x=>{if(pct>=x[0])rank=x[1]});
  return {xp,level,into,rank,checked,pct};
}
function renderWalDashboard(){
  const x=getXpData(), p=getAllProgress();
  const els={level:document.getElementById('playerLevel'),rank:document.getElementById('playerRank'),xp:document.getElementById('xpLabel'),next:document.getElementById('xpNext'),bar:document.getElementById('xpBar'),prog:document.getElementById('levelProgress'),mood:document.getElementById('whaleMood'),avatar:document.getElementById('whaleAvatar')};
  if(els.level)els.level.textContent=`LEVEL ${x.level}`;if(els.rank)els.rank.textContent=x.rank;if(els.xp)els.xp.textContent=`${x.xp.toLocaleString('de-DE')} XP`;if(els.next)els.next.textContent=`${100-x.into} XP bis zum nächsten Level`;if(els.bar)els.bar.style.width=x.into+'%';if(els.prog)els.prog.textContent=`${x.into} / 100 XP`;
  const mood=x.pct>=100?'🌌 Galaxie vollständig gesichert!':x.pct>=80?'👑 Fast am Ziel.':x.pct>=60?'🔥 Starkes Tempo!':x.pct>=40?'😎 Gute Sammlung.':x.pct>=20?'👀 Der Fortschritt nimmt Fahrt auf.':'🚀 Sammlung gestartet.';
  if(els.mood)els.mood.textContent=mood;
  if(els.avatar){els.avatar.textContent=x.pct>=100?'🌌':x.pct>=80?'👑':x.pct>=60?'🔥':x.pct>=40?'⚡':x.pct>=20?'🔎':'🚀';els.avatar.className='whale-avatar whale-'+(x.pct>=100?'final':x.pct>=80?'royal':x.pct>=60?'fire':x.pct>=40?'cool':x.pct>=20?'awake':'sleep');}
  const ids=[['mapDroids',p.d.pct],['mapFusion',p.f.pct],['mapIcons',p.i.pct],['mapRebirth',p.r.pct]];ids.forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v+'%'});
  [['tree1',x.checked>0],['tree2',p.d.done>=50],['tree3',p.f.pct===100],['tree4',p.i.pct===100],['tree5',x.pct>=99.999]].forEach(([id,on])=>{const e=document.getElementById(id);if(e)e.classList.toggle('unlocked',on)});
  const stats={statDroids:p.d.done,statFusion:p.f.done,statIcons:p.i.done,statRebirth:p.r.done,statXp:x.xp};Object.entries(stats).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=Number(v).toLocaleString('de-DE')});
  const ac=document.querySelectorAll('#achievements .unlocked').length, ae=document.getElementById('statAchievements');if(ae)ae.textContent=ac;
  const goal=getDailyGoal();const gp=document.getElementById('dailyGoalProgress'),gb=document.getElementById('dailyGoalBar'),gt=document.getElementById('dailyGoalText'),gh=document.getElementById('dailyGoalHint');if(gp)gp.textContent=`${goal.count} / 3`;if(gb)gb.style.width=Math.min(100,goal.count/3*100)+'%';if(gt)gt.textContent=goal.count>=3?'Tagesziel geschafft! 🐋':'Sammle heute noch '+(3-goal.count)+' Abschluss'+(3-goal.count===1?'':'e')+' für deinen Tagesbonus.';if(gh)gh.textContent=goal.count>=3?'Bonus gesichert – morgen wartet das nächste Ziel.':'3 Abschlüsse für den Tagesbonus';
}
function getDailyGoal(){const day=new Date().toISOString().slice(0,10);let list=[];try{list=JSON.parse(localStorage.getItem(STORE+'-activity')||'[]')}catch{}return {day,count:list.filter(x=>new Date(x.time).toISOString().slice(0,10)===day).length};}
function renderAchievements(ps){
  const el=document.getElementById('achievements'); if(!el)return;
  const [d,f,i]=ps; const r=getRebirthProgress(), all=p=>p.total>0&&p.done===p.total, x=getXpData();
  const secret=localStorage.getItem(STORE+'-secret')==='1';
  const ach=[['🏅','Erster Schritt','Den ersten Eintrag abgeschlossen',d.done+f.done+i.done>0],['🤖','Droidensammler','50 Droid-Varianten abgeschlossen',d.done>=50],['⚡','Fusion Master','Alle Fusionen abgeschlossen',all(f)],['⭐','Ikonenjäger','Alle Ikonen gefunden',all(i)],['🔄','Rebirth-Meister','Alle 200 Rebirth-Stufen erledigt',all(r)],['🔐','Geheimnis entdeckt','Das versteckte Easter-Egg gefunden',secret],['🔥','Serienjäger','Heute mindestens 3 Abschlüsse',getDailyGoal().count>=3],['👑','Galaktischer Meister','Droiden, Fusionen, Ikonen und Rebirth zu 100 %',all(d)&&all(f)&&all(i)&&all(r)]];
  el.innerHTML=ach.map(a=>`<article class="achievement ${a[3]?'unlocked':'locked'}"><span>${a[3]?a[0]:'🔒'}</span><div><b>${a[1]}</b><small>${a[2]}</small></div>${a[3]?'<strong>✓</strong>':'<em>???</em>'}</article>`).join('');
}
function initWalDashboard(){
  const clock=document.getElementById('liveClock');if(clock){const tick=()=>clock.textContent=new Date().toLocaleTimeString('de-DE');tick();setInterval(tick,1000)}
  const sound=localStorage.getItem(STORE+'-sound')!=='off';const btn=document.getElementById('soundToggle');if(btn)btn.textContent=sound?'🔊 SOUNDS AN':'🔇 SOUNDS AUS';if(btn)btn.addEventListener('click',()=>{const on=localStorage.getItem(STORE+'-sound')!=='off';localStorage.setItem(STORE+'-sound',on?'off':'on');btn.textContent=on?'🔇 SOUNDS AUS':'🔊 SOUNDS AN';});
  let typed='';document.addEventListener('keydown',e=>{typed=(typed+e.key.toLowerCase()).slice(-3);if(typed==='wal'){localStorage.setItem(STORE+'-secret','1');showSecret();playWfbSound(1000,.22);renderAchievements([getTrackerProgress('droids',D.droids,D.variants),getTrackerProgress('fusionen',D.fusionDroids,D.variants),getIconProgress(D.icons)]);renderWalDashboard();}});
  renderWalDashboard();renderEventRadar();setInterval(renderEventRadar,1000);
}
function playWfbSound(freq=880,duration=.35){if(localStorage.getItem(STORE+'-sound')==='off')return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration)}catch{}}
function renderEventRadar(){
  const el=document.getElementById('eventRadarList');if(!el)return;const now=new Date(), items=[];
  const drops=[['⭐','Stellar-Drop',[5,35]],['🔷','Kyber-Drop',[15]],['💗','Mythic-Drop',[55]]];
  function nextM(mins){for(let h=0;h<4;h++)for(const m of mins){const t=new Date(now);t.setHours(now.getHours()+h,m,0,0);if(t>now)return t}return null}
  drops.forEach(d=>{const t=nextM(d[2]);if(t)items.push({type:'drop',icon:d[0],name:d[1],time:t,detail:t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})})});
  const mini=[['🎧','DJ-R3X Tanzparty',2,[[16,19],[21,24]]],['📦','Mega-Crate Mini-Event',4,[[16,19],[21,24]]]];
  mini.forEach(e=>{for(let day=0;day<=7;day++){const base=new Date(now);base.setDate(now.getDate()+day);base.setHours(0,0,0,0);if(base.getDay()!==e[2])continue;for(const se of e[3]){const t=new Date(base);t.setHours(se[0],0,0,0);if(t>now){items.push({type:'event',icon:e[0],name:e[1],time:t,detail:t.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})+' · '+t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})});day=8;break}}}});
  items.sort((a,b)=>a.time-b.time);const shown=items.slice(0,5);const rn=document.getElementById('radarNow');if(rn)rn.textContent=now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  el.innerHTML=shown.map((x,i)=>`<div class="radar-row ${i===0?'radar-next':''}"><span class="radar-icon">${x.icon}</span><div><b>${x.name}</b><small>${x.type==='event'?'MINI-EVENT':'BLUEPRINT-DROP'} · ${x.detail}</small></div><strong>${formatShortCountdown(x.time-now)}</strong></div>`).join('');
}
function formatShortCountdown(ms){const s=Math.max(0,Math.floor(ms/1000)),d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sec=s%60;return d?`${d}T ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function resetAllProgress(){if(!confirm('Wirklich ALLE Tracker-Fortschritte, Achievements und Einstellungen auf diesem Gerät löschen?'))return;['droids','fusionen','icons','rebirth','rebirth-c1','rebirth-c2','rebirth-c3','rebirth-c4','rebirth-c5','activity','secret','sound','checklist-settings','home-clean'].forEach(k=>localStorage.removeItem(STORE+'-'+k));location.reload();}

function initHomeCleanMode(){
  const btn=document.getElementById('homeCleanToggle'), advanced=document.getElementById('advancedHome'); if(!btn||!advanced)return;
  const key=STORE+'-home-clean', clean=localStorage.getItem(key)!=='expanded';
  advanced.classList.toggle('collapsed-home',clean); btn.textContent=clean?'🧹 MEHR ANZEIGEN':'🧹 WENIGER ANZEIGEN';
  btn.addEventListener('click',()=>{const open=advanced.classList.toggle('collapsed-home');localStorage.setItem(key,open?'clean':'expanded');btn.textContent=open?'🧹 MEHR ANZEIGEN':'🧹 WENIGER ANZEIGEN';});
}

// v2.3 Clean Home helpers
// v2.0 Command Center helpers
function initCommandCenter(){
  const logo=document.querySelector('.brand img'); if(logo){let taps=0,timer;logo.addEventListener('click',e=>{e.preventDefault();taps++;clearTimeout(timer);if(taps>=5){taps=0;showSecret();}timer=setTimeout(()=>taps=0,1400);});}
  const search=document.getElementById('galaxySearch');
  if(search){
    const results=document.getElementById('galaxySearchResults');
    const all=[...(D.droids||[]).map(x=>({name:x.name,cat:'Droiden-Archiv',url:'droids.html'})),...(D.fusionDroids||[]).map(x=>({name:x.name,cat:'Fusionslabor',url:'fusionen.html'})),...(D.icons||[]).map(x=>({name:x.name,cat:'Ikonen-Tresor',url:'ikonen.html'}))];
    function doSearch(){const q=search.value.trim().toLowerCase(); if(!q){results.innerHTML='<div class="search-empty">SCAN BEREIT // Suche nach Droid, Fusion oder Ikone</div>';return;} const found=all.filter(x=>x.name.toLowerCase().includes(q)).slice(0,8); results.innerHTML=found.length?found.map(x=>`<a href="${x.url}?q=${encodeURIComponent(x.name)}"><b>${esc(x.name)}</b><small>${esc(x.cat)}</small><span>→</span></a>`).join(''):'<div class="search-empty">KEIN TREFFER // Datenbankeintrag nicht gefunden</div>';}
    search.addEventListener('input',doSearch); doSearch();
  }
  renderCommanderStatus(); renderNextMission(); initDropTimers(); initMiniEventTimers();
}

function renderCommanderStatus(){
  const el=document.getElementById('commanderStatus'); if(!el)return;
  const ps=[getTrackerProgress('droids',D.droids,D.variants),getTrackerProgress('fusionen',D.fusionDroids,D.variants),getIconProgress(D.icons)];
  const rb=getRebirthProgress();
  const done=ps.reduce((a,p)=>a+p.done,0)+rb.done, total=ps.reduce((a,p)=>a+p.total,0)+rb.total, pct=total?done/total*100:0;
  const ranks=[[0,'ANFÄNGER'],[10,'DROIDEN-SCOUT'],[30,'FUSIONS-TECHNIKER'],[50,'GALAXIE-SAMMLER'],[75,'DROID-TYCOON'],[100,'GALAKTISCHER MEISTER']];
  let rank=ranks[0][1]; ranks.forEach(r=>{if(pct>=r[0])rank=r[1]});
  el.innerHTML=`<span class="rank-kicker">COMMANDER STATUS</span><strong>${rank}</strong><small>${Math.round(pct)}% GALAXY SECURED // ${done}/${total}</small>`;
}
function renderNextMission(){
  const el=document.getElementById('nextMission'); if(!el)return;
  const d=getTrackerProgress('droids',D.droids,D.variants), f=getTrackerProgress('fusionen',D.fusionDroids,D.variants), i=getIconProgress(D.icons);
  let m;
  const r=getRebirthProgress();
  if(d.pct<100)m={tag:'DROIDEN-ARCHIV',title:`Noch ${d.total-d.done} Varianten warten`,desc:'Scanne das Archiv und sichere die nächste Droiden-Variante.',url:'droids.html'};
  else if(f.pct<100)m={tag:'FUSIONSLABOR',title:`Noch ${f.total-f.done} Varianten offen`,desc:'Die nächste Fusion wartet bereits auf ihre Zutaten.',url:'fusionen.html'};
  else if(i.pct<100)m={tag:'IKONEN-TRESOR',title:`Noch ${i.total-i.done} Ikonen fehlen`,desc:'Nur noch wenige Einträge bis zum vollständigen Tresor.',url:'ikonen.html'};
  else if(r.pct<100)m={tag:'REBIRTH-PROTOKOLL',title:`Noch ${r.total-r.done} Schritte offen`,desc:'Deine nächste große Reise beginnt im Rebirth-Protokoll.',url:'rebirth.html'};
  else m={tag:'GALAKTISCHER MEISTER',title:'Die komplette Galaxie ist gesichert',desc:'100 % erreicht. Du hast den Tracker vollständig abgeschlossen.',url:'index.html'};
  el.innerHTML=`<span class="mission-tag">${m.tag}</span><h3>${m.title}</h3><p>${m.desc}</p><a class="mission-btn" href="${m.url}">MISSION STARTEN →</a>`;
}
function initDropTimers(){
  const root=document.getElementById('dropTimers'); if(!root)return;
  const schedules={kyber:[15],mythic:[55],stellar:[5,35]};
  const labels={kyber:'KYBER',mythic:'MYTHIC',stellar:'STELLAR'};
  let lastDrop={};
  function nextFor(mins,now){const y=now.getFullYear(),mo=now.getMonth(),d=now.getDate(),h=now.getHours();for(let hour=0;hour<3;hour++)for(const m of mins){const t=new Date(y,mo,d,h+hour,m,0,0);if(t>now)return t;}return new Date(y,mo,d,h+3,mins[0],0,0);}
  function fmt(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');}
  function tick(){const now=new Date();root.querySelectorAll('[data-drop]').forEach(card=>{const key=card.dataset.drop,t=nextFor(schedules[key],now),ms=t-now,mins=schedules[key],due=mins.includes(now.getMinutes())&&now.getSeconds()<2,dueStamp=new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),0,0).getTime();card.querySelector('.drop-count').textContent=fmt(ms);card.querySelector('.drop-next').textContent=`NÄCHSTER ${labels[key]}-DROP // ${t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;card.classList.toggle('drop-live',due);if(due&&lastDrop[key]!==dueStamp){lastDrop[key]=dueStamp;triggerDrop(labels[key]);}});}
  function triggerDrop(name){const notice=document.getElementById('dropNotice');if(notice){notice.textContent=`⚡ ${name}-DROP JETZT DA // TRACKER-SIGNAL`;notice.classList.add('show');setTimeout(()=>notice.classList.remove('show'),8000);}document.title=`⚡ ${name}-DROP // Droid Tycoon Tracker`;setTimeout(()=>{document.title='Droid Tycoon Tracker'},5000);if('Notification'in window&&Notification.permission==='granted'){try{new Notification(`${name}-Drop ist da!`,{body:`Der ${name}-Blueprint-Drop ist jetzt aktiv.`})}catch{}}try{const C=window.AudioContext||window.webkitAudioContext;if(C){const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.5)}}catch{}}
  const bell=document.getElementById('enableAlerts');if(bell)bell.addEventListener('click',async()=>{if('Notification'in window){try{const permission=await Notification.requestPermission();bell.textContent=permission==='granted'?'🔔 ALARME AKTIV':'🔕 ALARM NUR AUF SEITE'}catch{bell.textContent='🔕 ALARM NUR AUF SEITE'}}else bell.textContent='🔕 BROWSER-ALARM NICHT VERFÜGBAR';});
  tick();setInterval(tick,1000);
}
function initMiniEventTimers(){
  const cards=document.querySelectorAll('[data-mini-event]'); if(!cards.length)return;
  // Aktueller Stand: Dienstag Dance Party und Donnerstag Mega-Crate Mini-Event.
  const events={
    dienstag:{day:2,sessions:[[16,19],[21,24]],name:'DJ-R3X Tanzparty'},
    donnerstag:{day:4,sessions:[[16,19],[21,24]],name:'Mega-Crate Mini-Event'}
  };
  function getSession(ev,now){
    const day=now.getDay();
    for(let delta=0;delta<=7;delta++){
      const target=(ev.day+delta)%7;
      const base=new Date(now);base.setDate(now.getDate()+delta);base.setHours(0,0,0,0);
      for(const [start,end] of ev.sessions){
        const a=new Date(base);a.setHours(start,0,0,0);
        const b=new Date(base);b.setHours(end===24?0:end,0,0,0);if(end===24)b.setDate(b.getDate()+1);
        if(delta===0&&now>=a&&now<b)return {state:'live',start:a,end:b};
        if(a>now)return {state:'next',start:a,end:b};
      }
    }
    return null;
  }
  function fmt(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
  function tick(){const now=new Date();cards.forEach(card=>{const ev=events[card.dataset.miniEvent],x=getSession(ev,now);if(!x)return;const live=card.querySelector('.event-live-state'),count=card.querySelector('.event-countdown'),next=card.querySelector('.event-next');card.classList.toggle('event-active',x.state==='live');live.textContent=x.state==='live'?'● JETZT LIVE':'● WARTET';live.classList.toggle('is-live',x.state==='live');if(x.state==='live'){count.textContent=fmt(x.end-now);next.textContent=`LÄUFT BIS ${x.end.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;}else{count.textContent=fmt(x.start-now);next.textContent=`NÄCHSTER START ${x.start.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})} · ${x.start.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`;}});}
  tick();setInterval(tick,1000);
}

function showSecret(){const el=document.getElementById('secretMessage');if(!el)return;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),5000)}
