(()=>{'use strict';const $=id=>document.getElementById(id);let client,user;const prefix='wfb-droid-tycoon-v3-';const status=(s)=>{$('profileMessage').textContent=s};const norm=(s)=>String(s||'').trim();function stats(){const data=window.TRACKER_DATA||{};const groups=[['Droiden',data.droids||[],'droids'],['Fusionen',data.fusionDroids||[],'fusionen'],['Ikonen',data.icons||[],'icons']];$('profileStats').replaceChildren();for(const [label,items,key] of groups){let saved={};try{saved=JSON.parse(localStorage.getItem(prefix+key)||'{}')}catch{}const count=items.reduce((n,item,i)=>n+(saved[item.name+'#'+i]?1:0),0);const el=document.createElement('div');el.className='profile-stat';const a=document.createElement('strong');a.textContent=count+' / '+items.length;const b=document.createElement('span');b.textContent=label;el.append(a,b);$('profileStats').append(el)}}async function init(){installDroidAvatars();stats();renderAchievements();for(let i=0;i<60&&!window.DT01Cloud;i++)await new Promise(r=>setTimeout(r,100));client=window.DT01Cloud?.client();if(!client){$('profileAuthStatus').textContent='Cloud-Anmeldung nicht verfügbar. Bitte online öffnen.';return}const session=await client.auth.getSession();user=session.data.session?.user;$('profileAccount').textContent=user?.email||'Nicht angemeldet';$('profileAuthStatus').textContent=user?'Angemeldet · Profil ist privat':'Bitte über ☁ ANMELDEN einloggen, um dein Profil zu speichern.';$('profileSave').disabled=!user;if(!user)return;const {data,error}=await client.from('player_profiles').select('username,avatar,bio').eq('user_id',user.id).maybeSingle();if(error){status('Profil-Datenbank noch nicht eingerichtet oder nicht erreichbar. Bitte zuerst das SQL-Setup ausführen.');return}if(data){$('profileName').value=data.username||'';$('profileAvatarChoice').value=data.avatar||'🤖';$('profileBio').value=data.bio||'';avatarRender(data.avatar||'🤖')}}$('profileAvatarChoice').onchange=()=>{avatarRender($('profileAvatarChoice').value)};$('profileForm').onsubmit=async(e)=>{e.preventDefault();if(!user)return status('Bitte zuerst anmelden.');const username=norm($('profileName').value);if(!/^[A-Za-z0-9_-]{3,24}$/.test(username))return status('Ungültiger Benutzername (3–24 Zeichen).');$('profileSave').disabled=true;status('Profil wird gespeichert …');const payload={user_id:user.id,username,avatar:$('profileAvatarChoice').value,bio:norm($('profileBio').value)};const {error}=await client.from('player_profiles').upsert(payload,{onConflict:'user_id'});$('profileSave').disabled=false;if(error){status(error.code==='23505'?'Dieser Benutzername ist bereits vergeben.':'Speichern fehlgeschlagen: '+error.message);return}status('✓ Profil sicher gespeichert. Nur du kannst es ansehen.');};
const rankTiers=[{at:0,name:'Rekrut',icon:'✦'},{at:10,name:'Droiden-Scout',icon:'⚙'},{at:25,name:'Galaktischer Sammler',icon:'★'},{at:50,name:'Archiv-Meister',icon:'✧'},{at:75,name:'Legende der Galaxis',icon:'✹'},{at:100,name:'Vollständiger Kodex',icon:'🏆'}];
const achievementDefs=[
{id:'first',title:'Erster Fund',desc:'Mindestens einen Eintrag gesammelt',test:s=>s.total>=1},
{id:'ten',title:'Auf Entdeckung',desc:'10 Einträge gesammelt',test:s=>s.total>=10},
{id:'quarter',title:'Viertel der Galaxis',desc:'25 % der Einträge gesammelt',test:s=>s.percent>=25},
{id:'half',title:'Halbe Galaxis',desc:'50 % der Einträge gesammelt',test:s=>s.percent>=50},
{id:'droids',title:'Droiden-Archiv',desc:'Alle Protokoll-Droiden gesammelt',test:s=>s.droids>=s.maxDroids},
{id:'fusions',title:'Fusions-Experte',desc:'Alle Fusionen gesammelt',test:s=>s.fusions>=s.maxFusions},
{id:'icons',title:'Ikonen-Jäger',desc:'Alle Ikonen gesammelt',test:s=>s.icons>=s.maxIcons},
{id:'all',title:'Kodex komplett',desc:'Alle Einträge gesammelt',test:s=>s.percent===100}
];
function collectionStats(){
 const data=window.TRACKER_DATA||{};
 const groups=[['droids',data.droids||[]],['fusionen',data.fusionDroids||[]],['icons',data.icons||[]]];
 const counts={};let total=0,max=0;
 for(const [key,items] of groups){
  let saved={};try{saved=JSON.parse(localStorage.getItem(prefix+key)||'{}')}catch{}
  const n=items.reduce((v,item,i)=>v+(saved[item.name+'#'+i]?1:0),0);
  counts[key]=n;counts['max'+key]=items.length;total+=n;max+=items.length;
 }
 return {total,max,percent:max?Math.round(total/max*100):0,droids:counts.droids,maxDroids:counts.maxdroids,fusions:counts.fusionen,maxFusions:counts.maxfusionen,icons:counts.icons,maxIcons:counts.maxicons};
}
function renderAchievements(){
 const s=collectionStats();const rank=[...rankTiers].reverse().find(r=>s.percent>=r.at)||rankTiers[0];
 $('profileRank').textContent=rank.icon+' '+rank.name+' · '+s.percent+' %';
 const root=$('profileBadges');root.replaceChildren();
 for(const item of achievementDefs){
  const earned=item.test(s),el=document.createElement('div');
  el.className='profile-badge '+(earned?'earned':'locked');
  const symbol=document.createElement('span');symbol.textContent=earned?'✦':'🔒';
  const body=document.createElement('div');const title=document.createElement('strong');title.textContent=item.title;
  const desc=document.createElement('small');desc.textContent=item.desc;
  body.append(title,desc);el.append(symbol,body);root.append(el);
 }
}
function avatarRender(value){
 const el=$('profileAvatar');el.replaceChildren();
 if(value?.startsWith('droid:')){
  const filename=value.slice(6);
  if(!/^[A-Za-z0-9_-]+\.webp$/.test(filename))return el.textContent='🤖';
  const img=document.createElement('img');img.alt='Droiden-Avatar';img.src='./assets/droid-default/'+filename;img.onerror=()=>{el.textContent='🤖'};el.append(img);
 }else el.textContent=value||'🤖';
}
function installDroidAvatars(){
 const select=$('profileAvatarChoice');
 const files=Object.values(DT01_PROFILE_AVATAR_FILES);
 for(const [name,file] of Object.entries(DT01_PROFILE_AVATAR_FILES)){
  const opt=document.createElement('option');opt.value='droid:'+file;opt.textContent='🤖 '+name;select.append(opt);
 }
}
const DT01_PROFILE_AVATAR_FILES={"BB8": "BB8.webp", "C-3PO": "C-3PO.webp", "Chopper": "Chopper.webp", "D-O": "D-O.webp", "GONK": "GONK.webp", "IG-11_MARSHAL": "IG-11_MARSHAL.webp", "MISTER_BONES": "MISTER_BONES.webp", "MOUSE": "MOUSE.webp", "R2-D2": "R2-D2.webp", "WHL-EX": "WHL-EX.webp"};
document.addEventListener('DOMContentLoaded',init)})();